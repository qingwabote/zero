import { SampleCountFlagBits, TextureUsageFlagBits } from "gfx-common";
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
        const gl = this._gl;
        let format = gl.RGBA8;
        if (this.info.usage & TextureUsageFlagBits.DEPTH_STENCIL) {
            format = gl.DEPTH_COMPONENT32F;
        }
        if (this.info.samples == SampleCountFlagBits.X1) {
            this._texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.texStorage2D(gl.TEXTURE_2D, 1, format, this.info.width, this.info.height);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        else {
            this._renderbuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderbuffer);
            gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this.info.samples, format, this.info.width, this.info.height);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        }
        return false;
    }
}
