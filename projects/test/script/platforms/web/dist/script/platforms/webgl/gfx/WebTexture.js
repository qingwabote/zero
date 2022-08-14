import Texture from "../../../core/gfx/Texture.js";
export default class WebTexture extends Texture {
    _gl;
    _texture;
    get texture() {
        return this._texture;
    }
    constructor(gl) {
        super();
        this._gl = gl;
    }
    initialize(info) {
        const gl = this._gl;
        this._texture = gl.createTexture();
    }
    update(imageBitmap) {
        const gl = this._gl;
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imageBitmap.width, imageBitmap.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
//# sourceMappingURL=WebTexture.js.map