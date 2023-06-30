import { FramebufferInfo } from "./info.js";

export interface Framebuffer {
    get info(): FramebufferInfo;
    initialize(info: FramebufferInfo): boolean;
}