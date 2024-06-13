import { Texture } from "./Texture.js";
import { TextureInfo } from "./info.js";
export class Swapchain {
    constructor(gl) {
        const colorTextureInfo = new TextureInfo;
        colorTextureInfo.swapchain = true;
        this.colorTexture = new Texture(gl, colorTextureInfo);
        this.width = gl.drawingBufferWidth;
        this.height = gl.drawingBufferHeight;
    }
    acquire(semaphore) { }
}
