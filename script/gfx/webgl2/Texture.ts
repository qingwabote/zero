import { SampleCountFlagBits } from "gfx-common";
import { TextureInfo } from "./info.js";
import { Formats } from "./internal/mapping.js";

export class Texture {
    private _texture!: WebGLTexture;
    get texture(): WebGLTexture {
        return this._texture;
    }

    private _renderbuffer!: WebGLRenderbuffer;
    get renderbuffer(): WebGLRenderbuffer {
        return this._renderbuffer;
    }

    constructor(private _gl: WebGL2RenderingContext, readonly info: TextureInfo) { }

    initialize(): boolean {
        const gl = this._gl;

        const internalformat = Formats[this.info.format].internalformat;
        if (!internalformat) {
            throw new Error(`unsupported texture format: ${this.info.format}`);
        }

        if (this.info.samples == SampleCountFlagBits.X1) {
            this._texture = gl.createTexture()!
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            // use texStorage2D to ceate a complete texture. texImage2D is incomplete
            // https://www.khronos.org/opengl/wiki/Texture#Texture_completeness
            gl.texStorage2D(gl.TEXTURE_2D, 1, internalformat, this.info.width, this.info.height);

            gl.bindTexture(gl.TEXTURE_2D, null);
        } else {
            this._renderbuffer = gl.createRenderbuffer()!
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderbuffer);
            gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this.info.samples, internalformat, this.info.width, this.info.height);

            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        }

        return false;
    }

    resize(width: number, height: number): void {
        this.info.width = width;
        this.info.height = height;
        this.initialize();
    }
}