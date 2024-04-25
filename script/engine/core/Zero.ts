import { EventEmitterImpl } from "bastard";
import { EventListener, GestureEvent, TouchEvent, attach, detach, device, initial, now } from "boot";
import { PipelineStageFlagBits, SubmitInfo } from "gfx";
import { Component } from "./Component.js";
import { Input, TouchEventName } from "./Input.js";
import { System } from "./System.js";
import { ComponentScheduler } from "./internal/ComponentScheduler.js";
import { TimeScheduler } from "./internal/TimeScheduler.js";
import { Pipeline } from "./render/Pipeline.js";
import { CommandCalls } from "./render/pipeline/CommandCalls.js";
import { ChangeRecord } from "./render/scene/ChangeRecord.js";
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

    private readonly _commandBuffer = device.createCommandBuffer();
    private readonly _presentSemaphore = device.createSemaphore();
    private readonly _renderSemaphore = device.createSemaphore();
    private readonly _renderFence = device.createFence();

    private readonly _inputEvents: Map<TouchEventName, any> = new Map;

    private _time = initial;

    private _commandCalls: CommandCalls = { renderPasses: 0, draws: 0 };
    public get commandCalls(): Readonly<CommandCalls> {
        return this._commandCalls;
    }

    public get pipeline(): Pipeline {
        return this._pipeline;
    }
    public set pipeline(value: Pipeline) {
        this._pipeline = value;
        this._pipeline.dump();
    }

    constructor(private _pipeline: Pipeline) {
        super();

        const systems: System[] = [...Zero._system2priority.keys()];
        systems.sort(function (a, b) {
            return Zero._system2priority.get(b)! - Zero._system2priority.get(a)!;
        })
        this._systems = systems;

        Zero._instance = this;
    }

    initialize() {
        this.start();
        return this;
    }

    protected abstract start(): void;

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
        for (const system of this._systems) {
            system.lateUpdate(delta);
        }
        this.emit(ZeroEvent.LOGIC_END);

        this.emit(ZeroEvent.RENDER_START);
        device.acquire(this._presentSemaphore);
        this.scene.update();
        this._pipeline.update();
        ChangeRecord.expire();
        this._commandBuffer.begin();

        this._commandCalls.renderPasses = 0;
        this._commandCalls.draws = 0;
        for (let i = 0; i < this.scene.cameras.length; i++) {
            this._pipeline.record(this._commandCalls, this._commandBuffer, i);
        }

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