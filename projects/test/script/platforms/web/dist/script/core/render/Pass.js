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
        const descriptorSet = gfx.createDescriptorSet();
        if (descriptorSet.initialize(this._shader.info.meta.descriptorSetLayout)) {
            throw new Error("descriptorSet initialize failed");
        }
        this._descriptorSet = descriptorSet;
    }
}
//# sourceMappingURL=Pass.js.map