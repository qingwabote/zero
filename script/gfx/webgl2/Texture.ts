import { SampleCountFlagBits, TextureUsageFlagBits } from "gfx-common";
import { TextureInfo } from "./info.js";

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

        let format: GLenum = gl.RGBA8;
        if (this.info.usage & TextureUsageFlagBits.DEPTH_STENCIL) {
            format = gl.DEPTH_COMPONENT32F
        }

        if (this.info.samples == SampleCountFlagBits.X1) {
            this._texture = gl.createTexture()!
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            // use texStorage2D to ceate a complete texture. texImage2D is incomplete
            // https://www.khronos.org/opengl/wiki/Texture#Texture_completeness
            gl.texStorage2D(gl.TEXTURE_2D, 1, format, this.info.width, this.info.height);

            gl.bindTexture(gl.TEXTURE_2D, null);
        } else {
            this._renderbuffer = gl.createRenderbuffer()!
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderbuffer);
            gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this.info.samples, format, this.info.width, this.info.height);

            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        }

        return false;
    }
}