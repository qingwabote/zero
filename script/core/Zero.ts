import AssetCache from "./AssetCache.js";
import EventEmitter from "./base/EventEmitter.js";
import ComponentScheduler from "./ComponentScheduler.js";
import CommandBuffer from "./gfx/CommandBuffer.js";
import Fence from "./gfx/Fence.js";
import { PipelineStageFlagBits } from "./gfx/Pipeline.js";
import Semaphore from "./gfx/Semaphore.js";
import Input, { InputEvent } from "./Input.js";
import Node from "./Node.js";
import PhysicsSystem from "./physics/PhysicsSystem.js";
import RenderFlow from "./pipeline/RenderFlow.js";
import RenderObject from "./render/RenderObject.js";
import { default as render_Scene } from "./render/Scene.js";
import Window from "./render/Window.js";
import Scene from "./Scene.js";
import ShaderLib from "./ShaderLib.js";
import TimeScheduler from "./TimeScheduler.js";

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
    readonly input: Input = new Input;

    readonly scene: Scene = new Scene;

    private _window!: Window;
    get window(): Window {
        return this._window;
    }

    private _render_scene!: render_Scene;
    get render_scene(): render_Scene {
        return this._render_scene;
    }

    readonly componentScheduler = new ComponentScheduler;

    readonly timeScheduler = new TimeScheduler;

    private _renderFlow!: RenderFlow;
    get renderFlow(): RenderFlow {
        return this._renderFlow;
    }

    private _commandBuffer!: CommandBuffer;
    private _presentSemaphore!: Semaphore;
    private _renderSemaphore!: Semaphore;
    private _renderFence!: Fence;

    async initialize(width: number, height: number): Promise<void> {
        this._window = { width, height };

        await Promise.all(ShaderLib.preloadedShaders.map(info => ShaderLib.instance.loadShader(info.name, info.macros)));

        await Promise.all(AssetCache.preloadedAssets.map(info => AssetCache.instance.load(info.path, info.type)));

        await PhysicsSystem.initialize();

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

        this._render_scene = new render_Scene();

        this._renderFlow = await this.start();
        this._renderFlow.initialize();
    }

    abstract start(): Promise<RenderFlow>;

    tick(name2event: Map<InputEvent, any>) {
        this.emit(ZeroEvent.LOGIC_START);
        for (const [name, event] of name2event) {
            this.input.emit(name, event);
        }
        this.componentScheduler.start();
        this.componentScheduler.update();
        this.timeScheduler.update();
        PhysicsSystem.instance.world.stepSimulation();
        this.componentScheduler.commit();
        this.emit(ZeroEvent.LOGIC_END);

        this.emit(ZeroEvent.RENDER_START);
        gfx.acquire(this._presentSemaphore);
        this._renderFlow.update();
        Node.frameId++;
        RenderObject.frameId++;
        this._commandBuffer.begin();
        this._renderFlow.record(this._commandBuffer);
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