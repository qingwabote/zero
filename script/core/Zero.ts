import EventEmitter from "./base/EventEmitter.js";
import ComponentScheduler from "./ComponentScheduler.js";
import CommandBuffer from "./gfx/CommandBuffer.js";
import Fence from "./gfx/Fence.js";
import { PipelineStageFlagBits } from "./gfx/Pipeline.js";
import Semaphore from "./gfx/Semaphore.js";
import Input from "./Input.js";
import Loader from "./Loader.js";
import RenderFlow from "./pipeline/RenderFlow.js";
import Platfrom from "./Platfrom.js";
import RenderScene from "./render/RenderScene.js";
import RenderWindow from "./render/RenderWindow.js";

enum Event {
    RENDER_START = "RENDER_START",
    RENDER_END = 'RENDER_END'
}

interface EventToListener {
    [Event.RENDER_START]: () => void;
    [Event.RENDER_END]: () => void;
}

export default abstract class Zero extends EventEmitter<EventToListener> {
    static Event = Event;

    private _input: Input = new Input;
    get input(): Input {
        return this._input;
    }

    private _loader!: Loader;
    get loader(): Loader {
        return this._loader;
    }

    private _platfrom!: Platfrom;
    get platfrom(): Platfrom {
        return this._platfrom;
    }

    private _window!: RenderWindow;
    get window(): RenderWindow {
        return this._window;
    }

    private _renderScene!: RenderScene;
    get renderScene(): RenderScene {
        return this._renderScene;
    }

    private _componentScheduler: ComponentScheduler = new ComponentScheduler;
    get componentScheduler(): ComponentScheduler {
        return this._componentScheduler;
    }

    private _renderFlow!: RenderFlow;
    get renderFlow(): RenderFlow {
        return this._renderFlow;
    }

    private _commandBuffer!: CommandBuffer;
    private _presentSemaphore!: Semaphore;
    private _renderSemaphore!: Semaphore;
    private _renderFence!: Fence;

    initialize(loader: Loader, platfrom: Platfrom, width: number, height: number): boolean {
        this._loader = loader;

        this._platfrom = platfrom;

        this._window = { width, height };

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

        this._renderScene = new RenderScene();

        this._renderFlow = this.start();
        this._renderFlow.initialize();

        return false;
    }

    abstract start(): RenderFlow;

    tick(dt: number) {
        this._componentScheduler.update(dt)

        gfx.acquire(this._presentSemaphore);

        this.emit(Event.RENDER_START);
        this._renderScene.update();
        this._renderFlow.update();
        this._renderScene.dirtyObjects.clear()
        this._commandBuffer.begin();
        this._renderFlow.record(this._commandBuffer);
        this._commandBuffer.end();
        this.emit(Event.RENDER_END);

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