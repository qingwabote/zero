import { SampleCountFlagBits, TextureUsageFlagBits } from "gfx-common";
import { TextureInfo } from "./info.js";

export class Texture {
    private _gl: WebGL2RenderingContext;

    private _texture!: WebGLTexture;
    get texture(): WebGLTexture {
        return this._texture;
    }

    private _renderbuffer!: WebGLRenderbuffer;
    get renderbuffer(): WebGLRenderbuffer {
        return this._renderbuffer;
    }

    private _info!: TextureInfo;
    get info(): TextureInfo {
        return this._info;
    }

    private _swapchain: boolean;
    get swapchain(): boolean {
        return this._swapchain;
    }

    constructor(gl: WebGL2RenderingContext, swapchain = false) {
        if (swapchain) {
            this._info = new TextureInfo;
        }
        this._swapchain = swapchain;
        this._gl = gl;
    }

    initialize(info: TextureInfo): boolean {
        const gl = this._gl;

        let format: GLenum = gl.RGBA8;
        if (info.usage & TextureUsageFlagBits.DEPTH_STENCIL) {
            format = gl.DEPTH_COMPONENT32F
        }

        if (info.samples == SampleCountFlagBits.X1) {
            this._texture = gl.createTexture()!
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.texStorage2D(gl.TEXTURE_2D, 1, format, info.width, info.height);

            gl.bindTexture(gl.TEXTURE_2D, null);
        } else {
            this._renderbuffer = gl.createRenderbuffer()!
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderbuffer);
            gl.renderbufferStorageMultisample(gl.RENDERBUFFER, info.samples, format, info.width, info.height);

            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        }

        this._info = info;
        return false;
    }
}