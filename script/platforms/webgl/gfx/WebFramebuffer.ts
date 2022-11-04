import { Framebuffer, FramebufferInfo } from "../../../core/gfx/Framebuffer.js";

export default class WebFramebuffer implements Framebuffer {
    initialize(info: FramebufferInfo): boolean {
        return false;
    }

} 