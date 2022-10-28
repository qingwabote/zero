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
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, info.width, info.height);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this._info = info;
        return false;
    }
}
//# sourceMappingURL=WebTexture.js.map