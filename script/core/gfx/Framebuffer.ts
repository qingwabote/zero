import Texture from "./Texture.js";

export interface FramebufferInfo {
    colorAttachments: Texture[];
    depthStencilAttachment: Texture;
}

export interface Framebuffer {
    initialize(info: FramebufferInfo): boolean;
}