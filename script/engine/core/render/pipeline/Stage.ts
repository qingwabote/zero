import { device } from "boot";
import { ClearFlagBits, CommandBuffer, Framebuffer, FramebufferInfo, TextureInfo, TextureUsageFlagBits } from "gfx";
import { Zero } from "../../Zero.js";
import { Rect } from "../../math/rect.js";
import { CommandCalls } from "./CommandCalls.js";
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
    readonly visibilities: number;

    constructor(
        private _phases: Phase[],
        private _framebuffer: Framebuffer = defaultFramebuffer,
        private _clears?: ClearFlagBits,
        public rect?: Readonly<Rect>
    ) {
        let visibilities = 0;
        for (const phase of _phases) {
            visibilities |= phase.visibility;
        }
        this.visibilities = visibilities;
    }

    record(commandCalls: CommandCalls, commandBuffer: CommandBuffer, cameraIndex: number) {
        const camera = Zero.instance.scene.cameras[cameraIndex];

        const renderPass = getRenderPass(this._framebuffer.info, this._clears ?? camera.clears);
        const rect = this.rect ?? camera.rect;

        const { width, height } = this._framebuffer.info;
        commandBuffer.beginRenderPass(renderPass, this._framebuffer, width * rect.x, height * rect.y, width * rect.width, height * rect.height);

        for (const phase of this._phases) {
            if (camera.visibilities & phase.visibility) {
                phase.record(commandCalls, commandBuffer, renderPass, cameraIndex);
            }
        }

        commandBuffer.endRenderPass();
        commandCalls.renderPasses++;
    }
}