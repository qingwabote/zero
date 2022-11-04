import RenderPass from "./RenderPass.js";
import Texture from "./Texture.js";

export interface FramebufferInfo {
    attachments: Texture[];
    renderPass: RenderPass;
    width: number;
    height: number;
}

export interface Framebuffer {
    initialize(info: FramebufferInfo): boolean;
}