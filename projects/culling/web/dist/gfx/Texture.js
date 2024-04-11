import { SampleCountFlagBits, TextureUsageFlagBits } from "gfx-common";
import { TextureInfo } from "./info.js";
export class Texture {
    get texture() {
        return this._texture;
    }
    get renderbuffer() {
        return this._renderbuffer;
    }
    get info() {
        return this._info;
    }
    get swapchain() {
        return this._swapchain;
    }
    constructor(gl, swapchain = false) {
        if (swapchain) {
            this._info = new TextureInfo;
        }
        this._swapchain = swapchain;
        this._gl = gl;
    }
    initialize(info) {
        const gl = this._gl;
        let format = gl.RGBA8;
        if (info.usage & TextureUsageFlagBits.DEPTH_STENCIL) {
            format = gl.DEPTH_COMPONENT32F;
        }
        if (info.samples == SampleCountFlagBits.X1) {
            this._texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.texStorage2D(gl.TEXTURE_2D, 1, format, info.width, info.height);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        else {
            this._renderbuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderbuffer);
            gl.renderbufferStorageMultisample(gl.RENDERBUFFER, info.samples, format, info.width, info.height);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        }
        this._info = info;
        return false;
    }
}
