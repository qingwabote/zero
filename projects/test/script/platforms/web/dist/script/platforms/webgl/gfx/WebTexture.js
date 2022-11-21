import { TextureUsageBit } from "../../../core/gfx/Texture.js";
export default class WebTexture {
    _gl;
    _texture;
    get texture() {
        return this._texture;
    }
    _info;
    get info() {
        return this._info;
    }
    constructor(gl) {
        this._gl = gl;
    }
    initialize(info) {
        const gl = this._gl;
        this._texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        let format = gl.RGBA8;
        if (info.usage & TextureUsageBit.DEPTH_STENCIL_ATTACHMENT) {
            format = gl.DEPTH_COMPONENT32F;
        }
        gl.texStorage2D(gl.TEXTURE_2D, 1, format, info.width, info.height);
        // just for rendering depth map
        // https://community.khronos.org/t/render-to-depth-texture/53858/4
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this._info = info;
        return false;
    }
}
//# sourceMappingURL=WebTexture.js.map