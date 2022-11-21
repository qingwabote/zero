import ComponentScheduler from "./ComponentScheduler.js";
import { PipelineStageFlagBits } from "./gfx/Pipeline.js";
import Input from "./Input.js";
import RenderScene from "./render/RenderScene.js";
export default class Zero {
    _input = new Input;
    get input() {
        return this._input;
    }
    _loader;
    get loader() {
        return this._loader;
    }
    _platfrom;
    get platfrom() {
        return this._platfrom;
    }
    _window;
    get window() {
        return this._window;
    }
    _renderScene;
    get renderScene() {
        return this._renderScene;
    }
    _frames = [];
    _frameIndex = 0;
    _componentScheduler = new ComponentScheduler;
    get componentScheduler() {
        return this._componentScheduler;
    }
    initialize(loader, platfrom, width, height) {
        this._loader = loader;
        this._platfrom = platfrom;
        this._window = { width, height };
        this._renderScene = new RenderScene();
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
            });
        }
        this._frameIndex = 1;
        return false;
    }
    tick(dt) {
        const current = this._frames[this._frameIndex];
        gfx.acquire(current.presentSemaphore);
        this._componentScheduler.update(dt);
        this._renderScene.update(dt);
        const commandBuffer = current.commandBuffer;
        this._renderScene.record(commandBuffer);
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
//# sourceMappingURL=Zero.js.map