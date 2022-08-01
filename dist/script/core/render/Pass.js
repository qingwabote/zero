export default class Pass {
    _shader;
    get shader() {
        return this._shader;
    }
    _descriptorSet;
    get descriptorSet() {
        return this._descriptorSet;
    }
    constructor(shader) {
        this._shader = shader;
        this._descriptorSet = { layout: this._shader.descriptorSetLayout, buffers: [], textures: [] };
    }
}
//# sourceMappingURL=Pass.js.map