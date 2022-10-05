import Texture, { TextureInfo } from "../../../core/gfx/Texture.js";

export default class WebTexture implements Texture {
    private _gl: WebGL2RenderingContext;

    private _texture!: WebGLTexture;
    get texture(): WebGLTexture {
        return this._texture;
    }

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    initialize(info: TextureInfo): boolean {
        const gl = this._gl;
        this._texture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, info.width, info.height);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return false;
    }
}