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
    constructor(_phases, visibilities, _framebuffer = defaultFramebuffer, _clears, rect) {
        this._phases = _phases;
        this.visibilities = visibilities;
        this._framebuffer = _framebuffer;
        this._clears = _clears;
        this.rect = rect;
    }
    record(profile, commandBuffer, cameraIndex) {
        var _a, _b;
        const camera = Zero.instance.scene.cameras[cameraIndex];
        const renderPass = getRenderPass(this._framebuffer.info, (_a = this._clears) !== null && _a !== void 0 ? _a : camera.clears);
        const rect = (_b = this.rect) !== null && _b !== void 0 ? _b : camera.rect;
        const { width, height } = this._framebuffer.info;
        commandBuffer.beginRenderPass(renderPass, this._framebuffer, width * rect[0], height * rect[1], width * rect[2], height * rect[3]);
        for (const phase of this._phases) {
            if (camera.visibilities & phase.visibility) {
                phase.record(profile, commandBuffer, renderPass, cameraIndex);
            }
        }
        commandBuffer.endRenderPass();
        profile.stages++;
    }
}
