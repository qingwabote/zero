import { device } from "boot";
import { ClearFlagBits, CommandBuffer, Framebuffer, FramebufferInfo, TextureInfo, TextureUsageFlagBits } from "gfx";
import { Zero } from "../../Zero.js";
import { Rect } from "../../math/rect.js";
import { Context } from "../Context.js";
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
    get framebuffer(): Framebuffer {
        return this._framebuffer;
    }

    constructor(
        private _context: Context,
        private _phases: Phase[],
        private _framebuffer: Framebuffer = defaultFramebuffer,
        private _clears?: ClearFlagBits,
        private _viewport?: Rect
    ) { }

    record(commandBuffer: CommandBuffer): number {
        const camera = Zero.instance.scene.cameras[this._context.cameraIndex];
        const phases = this._phases.filter(phase => camera.visibilities & phase.visibility);
        if (phases.length == 0) {
            return 0;
        }

        const clears = this._clears ?? camera.clears;
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