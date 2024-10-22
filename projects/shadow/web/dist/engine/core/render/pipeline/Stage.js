import { device } from "boot";
import { Format, FramebufferInfo, TextureInfo, TextureUsageFlagBits } from "gfx";
import { getRenderPass } from "./rpc.js";
const defaultFramebuffer = (function () {
    const { width, height } = device.swapchain.color.info;
    const framebufferInfo = new FramebufferInfo;
    framebufferInfo.width = width;
    framebufferInfo.height = height;
    framebufferInfo.colors.add(device.swapchain.color);
    const depthStencilAttachmentInfo = new TextureInfo;
    depthStencilAttachmentInfo.usage = TextureUsageFlagBits.DEPTH_STENCIL;
    depthStencilAttachmentInfo.format = Format.D32_SFLOAT;
    depthStencilAttachmentInfo.width = width;
    depthStencilAttachmentInfo.height = height;
    framebufferInfo.depthStencil = device.createTexture(depthStencilAttachmentInfo);
    framebufferInfo.renderPass = getRenderPass(framebufferInfo);
    return device.createFramebuffer(framebufferInfo);
})();
export class Stage {
    constructor(_data, phases, visibilities, _framebuffer = defaultFramebuffer, _clears, rect) {
        this._data = _data;
        this.phases = phases;
        this.visibilities = visibilities;
        this._framebuffer = _framebuffer;
        this._clears = _clears;
        this.rect = rect;
    }
    record(profile, commandBuffer) {
        var _a, _b;
        const camera = this._data.current_camera;
        const renderPass = getRenderPass(this._framebuffer.info, (_a = this._clears) !== null && _a !== void 0 ? _a : camera.clears);
        const rect = (_b = this.rect) !== null && _b !== void 0 ? _b : camera.rect;
        // do transfer before render pass
        for (const phase of this.phases) {
            if (camera.visibilities & phase.visibility) {
                phase.update(commandBuffer);
            }
        }
        const { width, height } = this._framebuffer.info;
        commandBuffer.beginRenderPass(renderPass, this._framebuffer, width * rect[0], height * rect[1], width * rect[2], height * rect[3]);
        for (const phase of this.phases) {
            if (camera.visibilities & phase.visibility) {
                phase.render(profile, commandBuffer, renderPass);
            }
        }
        commandBuffer.endRenderPass();
        profile.stages++;
    }
}
