import { SampleCountFlagBits } from "../../../main/gfx/Pipeline.js";
import Texture, { TextureInfo, TextureUsageBit } from "../../../main/gfx/Texture.js";

export default class WebTexture implements Texture {
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

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    initialize(info: TextureInfo): boolean {
        const gl = this._gl;

        let format = gl.RGBA8;
        if (info.usage & TextureUsageBit.DEPTH_STENCIL_ATTACHMENT) {
            format = gl.DEPTH_COMPONENT32F
        }

        if (info.samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
            this._texture = gl.createTexture()!;
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.texStorage2D(gl.TEXTURE_2D, 1, format, info.width, info.height);

            // just for rendering depth map
            // https://community.khronos.org/t/render-to-depth-texture/53858/4
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.bindTexture(gl.TEXTURE_2D, null);
        } else {
            this._renderbuffer = gl.createRenderbuffer()!;
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderbuffer);
            gl.renderbufferStorageMultisample(gl.RENDERBUFFER, info.samples, format, info.width, info.height);

            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        }

        this._info = info;
        return false;
    }
}