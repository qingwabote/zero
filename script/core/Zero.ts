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

interface Frame {
    commandBuffer: CommandBuffer;
    presentSemaphore: Semaphore;
    renderSemaphore: Semaphore;
    renderFence: Fence;
}

export default abstract class Zero {
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

    private _frames: Frame[] = [];
    private _frameIndex: number = 0;

    private _componentScheduler: ComponentScheduler = new ComponentScheduler;
    get componentScheduler(): ComponentScheduler {
        return this._componentScheduler;
    }

    private _renderFlow!: RenderFlow;
    get renderFlow(): RenderFlow {
        return this._renderFlow;
    }

    initialize(loader: Loader, platfrom: Platfrom, width: number, height: number): boolean {
        this._loader = loader;

        this._platfrom = platfrom;

        this._window = { width, height };

        for (let i = 0; i < 2; i++) {
            const commandBuffer = gfx.createCommandBuffer();
            commandBuffer.initialize();
            const presentSemaphore = gfx.createSemaphore();
            presentSemaphore.initialize();
            const renderSemaphore = gfx.createSemaphore();
            renderSemaphore.initialize();
            const renderFence = gfx.createFence();
            renderFence.initialize(i == 0);
            this._frames.push({
                commandBuffer, presentSemaphore, renderSemaphore, renderFence
            })
        }
        this._frameIndex = 1;

        this._renderScene = new RenderScene();

        this._renderFlow = this.start();
        this._renderFlow.initialize();

        return false;
    }

    abstract start(): RenderFlow;

    tick(dt: number) {
        const current = this._frames[this._frameIndex];

        gfx.acquire(current.presentSemaphore);

        this._componentScheduler.update(dt)

        this._renderScene.update(dt);

        this._renderFlow.update();

        this._renderScene.dirtyObjects.clear();

        const commandBuffer = current.commandBuffer;
        commandBuffer.begin();
        this._renderFlow.record(commandBuffer);
        commandBuffer.end();

        const last = this._frames[this._frameIndex > 0 ? this._frameIndex - 1 : this._frames.length - 1];
        gfx.waitFence(last.renderFence);

        gfx.submit({
            commandBuffer,
            waitSemaphore: current.presentSemaphore,
            waitDstStageMask: PipelineStageFlagBits.PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT,
            signalSemaphore: current.renderSemaphore
        }, current.renderFence);
        gfx.present(current.renderSemaphore);

        this._frameIndex = this._frameIndex < this._frames.length - 1 ? this._frameIndex + 1 : 0;
    }
} 