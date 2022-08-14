import WebBuffer from "./WebBuffer.js";
import WebCommandBuffer from "./WebCommandBuffer.js";
import WebShader from "./WebShader.js";
import WebTexture from "./WebTexture.js";
export default class WebDevice {
    _gl;
    _commandBuffer;
    get commandBuffer() {
        return this._commandBuffer;
    }
    constructor(gl) {
        this._commandBuffer = new WebCommandBuffer(gl);
        this._gl = gl;
    }
    createShader(info) {
        const shader = new WebShader(this._gl);
        shader.initialize(info);
        return shader;
    }
    createBuffer(info) {
        return new WebBuffer(this._gl, info);
    }
    createTexture(info) {
        const texture = new WebTexture(this._gl);
        texture.initialize(info);
        return texture;
    }
    createImageBitmap(blob) {
        return createImageBitmap(blob);
    }
}
//# sourceMappingURL=WebDevice.js.map