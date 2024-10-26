import { device } from "boot";
import { ClearFlagBits, Format, Framebuffer, FramebufferInfo, TextureInfo, TextureUsageFlagBits } from "gfx";
import { Vec4 } from "../../math/vec4.js";
import { Context } from "../Context.js";
import { Pass } from "../scene/Pass.js";
import { Batch } from "./Batch.js";
import { Phase } from "./Phase.js";
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

    return device.createFramebuffer(framebufferInfo)
})();

export class Stage {
    constructor(
        readonly phases: readonly Phase[],
        readonly visibilities: number,
        readonly framebuffer: Framebuffer = defaultFramebuffer,
        readonly clears?: ClearFlagBits,
        readonly rect?: Readonly<Vec4>
    ) { }

    queue(buffer_pass: Pass[], buffer_batch: Batch[], buffer_index: number, context: Context, cameraIndex: number): number {
        const camera = context.scene.cameras[cameraIndex];
        // do transfer before render pass
        for (const phase of this.phases) {
            if (camera.visibilities & phase.visibility) {
                buffer_index = phase.queue(buffer_pass, buffer_batch, buffer_index, context, cameraIndex);
            }
        }
        return buffer_index;
    }
}