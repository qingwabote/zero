import { Semaphore } from "./Semaphore.js";
import { Texture } from "./Texture.js";
import { TextureInfo } from "./info.js";

export class Swapchain {
    readonly colorTexture: Texture;
    readonly width: number;
    readonly height: number;

    constructor(
        gl: WebGL2RenderingContext
    ) {
        const colorTextureInfo = new TextureInfo;
        colorTextureInfo.swapchain = true;
        this.colorTexture = new Texture(gl, colorTextureInfo);
        this.width = gl.drawingBufferWidth;
        this.height = gl.drawingBufferHeight
    }

    acquire(semaphore: Semaphore): void { }
}