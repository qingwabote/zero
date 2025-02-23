import { Texture } from "./Texture.js";
import { TextureInfo } from "./info.js";
import { Format } from "./shared/constants.js";
export class Swapchain {
    constructor(gl) {
        const colorInfo = new TextureInfo;
        colorInfo.swapchain = true;
        colorInfo.format = Format.RGBA8_UNORM;
        colorInfo.width = gl.drawingBufferWidth;
        colorInfo.height = gl.drawingBufferHeight;
        this.color = new Texture(gl, colorInfo);
    }
    acquire(semaphore) { }
}
