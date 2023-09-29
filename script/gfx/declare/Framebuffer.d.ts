import { FramebufferInfo } from "./info.js";

export declare class Framebuffer {
    get info(): FramebufferInfo;
    private constructor(...args);
    initialize(info: FramebufferInfo): boolean;
}