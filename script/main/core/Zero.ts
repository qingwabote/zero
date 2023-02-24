import EventEmitter from "../base/EventEmitter.js";
import Asset from "./Asset.js";
import Component from "./Component.js";
import CommandBuffer from "./gfx/CommandBuffer.js";
import Fence from "./gfx/Fence.js";
import { PipelineStageFlagBits } from "./gfx/Pipeline.js";
import Semaphore from "./gfx/Semaphore.js";
import Input, { InputEvent } from "./Input.js";
import ComponentScheduler from "./internal/ComponentScheduler.js";
import TimeScheduler from "./internal/TimeScheduler.js";
import Node from "./Node.js";
import Flow from "./pipeline/Flow.js";
import RenderObject from "./render/RenderObject.js";
import Scene from "./render/Scene.js";
import Window from "./render/Window.js";
import ShaderLib from "./ShaderLib.js";
import System from "./System.js";

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

export default abstract class Zero extends EventEmitter<EventToListener> {
    private static readonly _system2priority: Map<System, number> = new Map;

    static registerSystem(system: System, priority: number) {
        this._system2priority.set(system, priority);
    }

    readonly window: Window;

    readonly input = new Input;

    readonly scene = new Scene;

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

    constructor(width: number, height: number) {
        super();

        const systems: System[] = [...Zero._system2priority.keys()];
        systems.sort(function (a, b) {
            return Zero._system2priority.get(b)! - Zero._system2priority.get(a)!;
        })
        this._systems = systems;

        this.window = { width, height };
    }

    async initialize(): Promise<void> {
        await Promise.all(ShaderLib.preloadedShaders.map(info => ShaderLib.instance.loadShader(info.name, info.macros)));

        await Promise.all(Asset.preloadedAssets.map(info => Asset.cache.load(info.path, info.type)));

        for (const system of this._systems) {
            await system.initialize();
        }

        const commandBuffer = gfx.createCommandBuffer();
        commandBuffer.initialize();
        this._commandBuffer = commandBuffer;

        const presentSemaphore = gfx.createSemaphore();
        presentSemaphore.initialize();
        this._presentSemaphore = presentSemaphore;

        const renderSemaphore = gfx.createSemaphore();
        renderSemaphore.initialize();
        this._renderSemaphore = renderSemaphore;

        const renderFence = gfx.createFence();
        renderFence.initialize(true);
        this._renderFence = renderFence;

        this._flow = await this.start();
        this._flow.initialize();
    }

    abstract start(): Promise<Flow>;

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
        this._componentScheduler.start();
        this._componentScheduler.update();
        this._timeScheduler.update();
        for (const system of this._systems) {
            system.update();
        }
        this._componentScheduler.commit();
        this.emit(ZeroEvent.LOGIC_END);

        this.emit(ZeroEvent.RENDER_START);
        gfx.acquire(this._presentSemaphore);
        this._flow.update();
        Node.frameId++;
        RenderObject.frameId++;
        this._commandBuffer.begin();
        this._flow.record(this._commandBuffer);
        this._commandBuffer.end();
        this.emit(ZeroEvent.RENDER_END);

        gfx.queue.submit({
            commandBuffer: this._commandBuffer,
            waitSemaphore: this._presentSemaphore,
            waitDstStageMask: PipelineStageFlagBits.PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT,
            signalSemaphore: this._renderSemaphore
        }, this._renderFence);
        gfx.queue.present(this._renderSemaphore);
        gfx.queue.waitFence(this._renderFence);
    }
} 