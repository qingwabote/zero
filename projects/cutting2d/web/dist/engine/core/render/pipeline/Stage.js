import { device } from "boot";
import { FramebufferInfo, TextureInfo, TextureUsageFlagBits } from "gfx";
import { Zero } from "../../Zero.js";
import { getRenderPass } from "./rpc.js";
const defaultFramebuffer = (function () {
    const framebufferInfo = new FramebufferInfo;
    framebufferInfo.width = device.swapchain.width;
    framebufferInfo.height = device.swapchain.height;
    framebufferInfo.colors.add(device.swapchain.colorTexture);
    const depthStencilAttachmentInfo = new TextureInfo;
    depthStencilAttachmentInfo.usage = TextureUsageFlagBits.DEPTH_STENCIL;
    depthStencilAttachmentInfo.width = framebufferInfo.width;
    depthStencilAttachmentInfo.height = framebufferInfo.height;
    framebufferInfo.depthStencil = device.createTexture(depthStencilAttachmentInfo);
    framebufferInfo.renderPass = getRenderPass(framebufferInfo);
    return device.createFramebuffer(framebufferInfo);
})();
export class Stage {
    get framebuffer() {
        return this._framebuffer;
    }
    constructor(_context, _phases, _framebuffer = defaultFramebuffer, _clears, _viewport) {
        this._context = _context;
        this._phases = _phases;
        this._framebuffer = _framebuffer;
        this._clears = _clears;
        this._viewport = _viewport;
    }
    record(commandBuffer) {
        var _a;
        const camera = Zero.instance.scene.cameras[this._context.cameraIndex];
        const phases = this._phases.filter(phase => camera.visibilities & phase.visibility);
        if (phases.length == 0) {
            return 0;
        }
        const clears = (_a = this._clears) !== null && _a !== void 0 ? _a : camera.clears;
        const renderPass = getRenderPass(this._framebuffer.info, clears);
        const viewport = this._viewport || camera.viewport;
        commandBuffer.beginRenderPass(renderPass, this._framebuffer, viewport.x, viewport.y, viewport.width, viewport.height);
        let dc = 0;
        for (const phase of phases) {
            dc += phase.record(commandBuffer, renderPass);
        }
        commandBuffer.endRenderPass();
        return dc;
    }
}
