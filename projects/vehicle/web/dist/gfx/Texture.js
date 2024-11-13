import { SampleCountFlagBits } from "gfx-common";
import { Formats } from "./internal/mapping.js";
export class Texture {
    get texture() {
        return this._texture;
    }
    get renderbuffer() {
        return this._renderbuffer;
    }
    constructor(_gl, info) {
        this._gl = _gl;
        this.info = info;
    }
    initialize() {
        if (this.info.width > 0 && this.info.height > 0) {
            const gl = this._gl;
            const internalformat = Formats[this.info.format].internalformat;
            if (!internalformat) {
                throw new Error(`unsupported texture format: ${this.info.format}`);
            }
            if (this.info.samples == SampleCountFlagBits.X1) {
                this._texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this._texture);
                // use texStorage2D to ceate a complete texture. texImage2D is incomplete
                // https://www.khronos.org/opengl/wiki/Texture#Texture_completeness
                gl.texStorage2D(gl.TEXTURE_2D, 1, internalformat, this.info.width, this.info.height);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            else {
                this._renderbuffer = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderbuffer);
                gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this.info.samples, internalformat, this.info.width, this.info.height);
                gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            }
        }
        return false;
    }
    resize(width, height) {
        this.info.width = width;
        this.info.height = height;
        this.initialize();
    }
}
