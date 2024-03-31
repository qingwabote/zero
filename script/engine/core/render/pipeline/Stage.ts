import { device } from "boot";
import { ClearFlagBits, CommandBuffer, Framebuffer, FramebufferInfo, TextureInfo, TextureUsageFlagBits } from "gfx";
import { Zero } from "../../Zero.js";
import { Rect } from "../../math/rect.js";
import { Phase } from "./Phase.js";
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

    return device.createFramebuffer(framebufferInfo)
})();

export class Stage {
    constructor(
        private _phases: Phase[],
        private _framebuffer: Framebuffer = defaultFramebuffer,
        private _clears?: ClearFlagBits,
        public rect?: Readonly<Rect>
    ) { }

    record(commandBuffer: CommandBuffer, cameraIndex: number): number {
        const camera = Zero.instance.scene.cameras[cameraIndex];
        const phases = this._phases.filter(phase => camera.visibilities & phase.visibility);
        if (phases.length == 0) {
            return 0;
        }

        const renderPass = getRenderPass(this._framebuffer.info, this._clears ?? camera.clears);
        if (this.rect) {
            const { width, height } = this._framebuffer.info;
            commandBuffer.beginRenderPass(renderPass, this._framebuffer, this.rect.x * width, this.rect.y * height, this.rect.width * width, this.rect.height * height);
        } else {
            commandBuffer.beginRenderPass(renderPass, this._framebuffer, camera.viewport.x, camera.viewport.y, camera.viewport.width, camera.viewport.height);
        }

        let dc = 0;
        for (const phase of phases) {
            dc += phase.record(commandBuffer, renderPass, cameraIndex);
        }

        commandBuffer.endRenderPass();

        return dc;
    }
}