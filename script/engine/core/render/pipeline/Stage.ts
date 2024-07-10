import { device } from "boot";
import { ClearFlagBits, CommandBuffer, Framebuffer, FramebufferInfo, TextureInfo, TextureUsageFlagBits } from "gfx";
import { Vec4 } from "../../math/vec4.js";
import { Data } from "./Data.js";
import { Phase } from "./Phase.js";
import { Profile } from "./Profile.js";
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
        private readonly _data: Data,
        public readonly phases: readonly Phase[],
        readonly visibilities: number,
        private _framebuffer: Framebuffer = defaultFramebuffer,
        private _clears?: ClearFlagBits,
        public rect?: Readonly<Vec4>
    ) { }

    record(profile: Profile, commandBuffer: CommandBuffer) {
        const camera = this._data.current_camera;
        const renderPass = getRenderPass(this._framebuffer.info, this._clears ?? camera.clears);
        const rect = this.rect ?? camera.rect;

        const { width, height } = this._framebuffer.info;
        commandBuffer.beginRenderPass(renderPass, this._framebuffer, width * rect[0], height * rect[1], width * rect[2], height * rect[3]);

        for (const phase of this.phases) {
            if (camera.visibilities & phase.visibility) {
                phase.record(profile, commandBuffer, renderPass, camera);
            }
        }

        commandBuffer.endRenderPass();
        profile.stages++;
    }
}