import { CommandBuffer, Fence, PipelineStageFlagBits, Semaphore, impl } from "gfx-main";
import { EventEmitterImpl } from "../base/EventEmitterImpl.js";
import { Component } from "./Component.js";
import { Input, InputEvent } from "./Input.js";
import { System } from "./System.js";
import { device } from "./impl.js";
import { ComponentScheduler } from "./internal/ComponentScheduler.js";
import { TimeScheduler } from "./internal/TimeScheduler.js";
import { Flow } from "./render/pipeline/Flow.js";
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

export abstract class Zero extends EventEmitterImpl<EventToListener> {
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

    private _flow!: Flow;
    get flow(): Flow {
        return this._flow;
    }

    private _commandBuffer!: CommandBuffer;
    private _presentSemaphore!: Semaphore;
    private _renderSemaphore!: Semaphore;
    private _renderFence!: Fence;

    constructor() {
        super();

        const systems: System[] = [...Zero._system2priority.keys()];
        systems.sort(function (a, b) {
            return Zero._system2priority.get(b)! - Zero._system2priority.get(a)!;
        })
        this._systems = systems;

        Zero._instance = this;
    }

    initialize(): void {
        const commandBuffer = device.createCommandBuffer();
        commandBuffer.initialize();
        this._commandBuffer = commandBuffer;

        const presentSemaphore = device.createSemaphore();
        presentSemaphore.initialize();
        this._presentSemaphore = presentSemaphore;

        const renderSemaphore = device.createSemaphore();
        renderSemaphore.initialize();
        this._renderSemaphore = renderSemaphore;

        const renderFence = device.createFence();
        renderFence.initialize();
        this._renderFence = renderFence;

        this._flow = this.start();
        this._flow.initialize();

        for (const system of this._systems) {
            system.start();
        }
    }

    abstract start(): Flow;

    addComponent(com: Component): void {
        this._componentScheduler.add(com);
    }

    setInterval(func: () => void, delay: number = 0) {
        return this._timeScheduler.setInterval(func, delay);
    }

    clearInterval(func: () => void) {
        this._timeScheduler.clearInterval(func);
    }

    tick(name2event: Map<InputEvent, any>) {
        this.emit(ZeroEvent.LOGIC_START);
        for (const [name, event] of name2event) {
            this.input.emit(name, event);
        }
        this._componentScheduler.update();
        this._timeScheduler.update();
        for (const system of this._systems) {
            system.update();
        }
        this._componentScheduler.lateUpdate();
        this.emit(ZeroEvent.LOGIC_END);

        this.emit(ZeroEvent.RENDER_START);
        device.acquire(this._presentSemaphore);
        this.scene.update();
        this._flow.update();
        FrameChangeRecord.frameId++;
        this._commandBuffer.begin();
        this._flow.record(this._commandBuffer, this.scene);
        this._commandBuffer.end();
        this.emit(ZeroEvent.RENDER_END);

        const submitInfo = new impl.SubmitInfo;
        submitInfo.commandBuffer = this._commandBuffer;
        submitInfo.waitSemaphore = this._presentSemaphore;
        submitInfo.waitDstStageMask = PipelineStageFlagBits.PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
        submitInfo.signalSemaphore = this._renderSemaphore;
        device.queue.submit(submitInfo, this._renderFence);
        device.queue.present(this._renderSemaphore);
        device.queue.waitFence(this._renderFence);
    }
} 