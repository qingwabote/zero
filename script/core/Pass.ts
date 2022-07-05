import Shader from "./Shader.js";

export default class Pass {
    private _shader: Shader;
    get shader(): Shader {
        return this._shader;
    }

    constructor(shader: Shader) {
        this._shader = shader;
    }
}