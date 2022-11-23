import RenderPass from "./RenderPass.js";
import Texture from "./Texture.js";

export interface FramebufferInfo {
    colorAttachments: Texture[];
    depthStencilAttachment: Texture;
    resolveAttachments: Texture[];
    renderPass: RenderPass;
    width: number;
    height: number;
}

export interface Framebuffer {
    get info(): FramebufferInfo;
    initialize(info: FramebufferInfo): boolean;
}