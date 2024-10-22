import { Format } from "gfx-common";
import { Semaphore } from "./Semaphore.js";
import { Texture } from "./Texture.js";
import { TextureInfo } from "./info.js";

export class Swapchain {
    readonly color: Texture;

    constructor(gl: WebGL2RenderingContext) {
        const colorInfo = new TextureInfo;
        colorInfo.swapchain = true;
        colorInfo.format = Format.RGBA8_UNORM;
        colorInfo.width = gl.drawingBufferWidth;
        colorInfo.height = gl.drawingBufferHeight;
        this.color = new Texture(gl, colorInfo);
    }

    acquire(semaphore: Semaphore): void { }
}