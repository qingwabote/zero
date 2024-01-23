import { EventEmitterImpl } from "bastard";
import { EventListener, GestureEvent, TouchEvent, attach, detach, device, initial, now } from "boot";
import { CommandBuffer, Fence, PipelineStageFlagBits, Semaphore, SubmitInfo } from "gfx";
import { Component } from "./Component.js";
import { Input, TouchEventName } from "./Input.js";
import { System } from "./System.js";
import { ComponentScheduler } from "./internal/ComponentScheduler.js";
import { TimeScheduler } from "./internal/TimeScheduler.js";
import { Pipeline } from "./render/Pipeline.js";
import { FrameChangeRecord } from "./render/scene/FrameChangeRecord.js";
import { Root } from "./render/scene/Root.js";

export enum ZeroEvent {
    LOGIC_START = "LOGIC_START",
    LOGIC_END = "LOGIC_END",

    RENDER_START = "RENDER_START",
    RENDER_END = 'RENDER_END'
}

interface EventToListener {
    [ZeroEvent.LOGIC_START]: () => void;
    [ZeroEvent.LOGIC_END]: () => void;

    [ZeroEvent.RENDER_START]: () => void;
    [ZeroEvent.RENDER_END]: () => void;
}

export abstract class Zero extends EventEmitterImpl<EventToListener> implements EventListener {
    private static _instance: Zero;
    public static get instance(): Zero {
        return Zero._instance;
    }

    private static readonly _system2priority: Map<System, number> = new Map;

    static registerSystem(system: System, priority: number) {
        this._system2priority.set(system, priority);
    }

    readonly input = new Input;

    readonly scene = new Root;

    private readonly _componentScheduler = new ComponentScheduler;

    private readonly _timeScheduler = new TimeScheduler;

    private readonly _systems: readonly System[];

    pipeline!: Pipeline;

    private _commandBuffer: CommandBuffer;
    private _presentSemaphore: Semaphore;
    private _renderSemaphore: Semaphore;
    private _renderFence: Fence;

    private _inputEvents: Map<TouchEventName, any> = new Map;

    private _time = initial;

    private _drawCall: number = 0;
    get drawCall() {
        return this._drawCall;
    }

    constructor() {
        super();

        const systems: System[] = [...Zero._system2priority.keys()];
        systems.sort(function (a, b) {
            return Zero._system2priority.get(b)! - Zero._system2priority.get(a)!;
        })
        this._systems = systems;

        const commandBuffer = device.createCommandBuffer();
        this._commandBuffer = commandBuffer;

        const presentSemaphore = device.createSemaphore();
        this._presentSemaphore = presentSemaphore;

        const renderSemaphore = device.createSemaphore();
        this._renderSemaphore = renderSemaphore;

        const renderFence = device.createFence();
        this._renderFence = renderFence;

        Zero._instance = this;
    }

    initialize() {
        this.pipeline = this.start();
        this.attach();
    }

    attach() {
        attach(this);
    }

    detach() {
        detach(this);
    }

    addComponent(com: Component): void {
        this._componentScheduler.add(com);
    }

    setInterval(func: () => void, delay: number = 0) {
        return this._timeScheduler.setInterval(func, delay);
    }

    clearInterval(func: () => void) {
        this._timeScheduler.clearInterval(func);
    }

    protected abstract start(): Pipeline;

    onTouchStart(event: TouchEvent) {
        this._inputEvents.set(TouchEventName.START, event)
    }
    onTouchMove(event: TouchEvent) {
        this._inputEvents.set(TouchEventName.MOVE, event)
    }
    onTouchEnd(event: TouchEvent) {
        this._inputEvents.set(TouchEventName.END, event)
    }
    onGesturePinch(event: GestureEvent) {
        this._inputEvents.set(TouchEventName.PINCH, event)
    }
    onGestureRotate(event: GestureEvent) {
        this._inputEvents.set(TouchEventName.ROTATE, event)
    }

    onFrame() {
        this.emit(ZeroEvent.LOGIC_START);

        const time = now();
        const delta = (time - this._time) / 1000;
        this._time = time;

        for (const [name, event] of this._inputEvents) {
            this.input.emit(name, event);
        }
        this._inputEvents.clear();

        this._componentScheduler.update(delta);
        this._timeScheduler.update();
        for (const system of this._systems) {
            system.update(delta);
        }
        this._componentScheduler.lateUpdate();
        this.emit(ZeroEvent.LOGIC_END);

        this.emit(ZeroEvent.RENDER_START);
        device.acquire(this._presentSemaphore);
        this.scene.update();
        this.pipeline.update();
        FrameChangeRecord.frameId++;
        this._commandBuffer.begin();
        this._drawCall = this.pipeline.record(this._commandBuffer, this.scene.cameras);
        this._commandBuffer.end();
        this.emit(ZeroEvent.RENDER_END);

        const submitInfo = new SubmitInfo;
        submitInfo.commandBuffer = this._commandBuffer;
        submitInfo.waitSemaphore = this._presentSemaphore;
        submitInfo.waitDstStageMask = PipelineStageFlagBits.PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
        submitInfo.signalSemaphore = this._renderSemaphore;
        device.queue.submit(submitInfo, this._renderFence);
        device.queue.present(this._renderSemaphore);
        device.queue.waitFence(this._renderFence);
    }
} 