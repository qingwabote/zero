import { Semaphore } from "./Semaphore.js";
import { Texture } from "./Texture.js";

export class Swapchain {
    readonly colorTexture: Texture;
    readonly width: number;
    readonly height: number;

    constructor(
        gl: WebGL2RenderingContext
    ) {
        this.colorTexture = new Texture(gl, true);
        this.width = gl.drawingBufferWidth;
        this.height = gl.drawingBufferHeight
    }

    acquire(semaphore: Semaphore): void { }
}