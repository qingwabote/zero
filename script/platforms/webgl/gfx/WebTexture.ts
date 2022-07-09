import Texture, { TextureInfo } from "../../../core/gfx/Texture.js";

export default class WebTexture extends Texture {
    private _gl: WebGL2RenderingContext;

    private _texture!: WebGLTexture;
    get texture(): WebGLTexture {
        return this._texture;
    }

    constructor(gl: WebGL2RenderingContext) {
        super();
        this._gl = gl;
    }

    initialize(info: TextureInfo): void {
        const gl = this._gl;
        this._texture = gl.createTexture()!
    }

    update(imageBitmap: ImageBitmap): void {
        const gl = this._gl;
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imageBitmap.width, imageBitmap.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}