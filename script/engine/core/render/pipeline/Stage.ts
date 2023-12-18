import { device } from "boot";
import { CommandBuffer, Framebuffer, FramebufferInfo, RenderPass, TextureInfo, TextureUsageFlagBits } from "gfx";
import { Rect } from "../../math/rect.js";
import { Camera } from "../scene/Camera.js";
import { Root } from "../scene/Root.js";
import { Phase } from "./Phase.js";
import { Uniform } from "./Uniform.js";
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
        readonly uniforms: readonly (new () => Uniform)[],
        private _phases: Phase[],
        private _framebuffer: Framebuffer = defaultFramebuffer,
        private _renderPass?: RenderPass,
        private _viewport?: Rect
    ) { }

    record(commandBuffer: CommandBuffer, scene: Root, camera: Camera): number {
        const phases = this._phases.filter(phase => camera.visibilities & phase.visibility);
        if (phases.length == 0) {
            return 0;
        }

        const renderPass = this._renderPass || getRenderPass(this._framebuffer.info, camera.clearFlags);
        const viewport = this._viewport || camera.viewport;

        commandBuffer.beginRenderPass(renderPass, this._framebuffer, viewport.x, viewport.y, viewport.width, viewport.height);

        let dc = 0;
        for (const phase of phases) {
            dc += phase.record(commandBuffer, scene, camera, renderPass);
        }

        commandBuffer.endRenderPass();

        return dc;
    }
}