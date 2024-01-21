import { Pass } from "./core/render/scene/Pass.js";
import { shaderLib } from "./core/shaderLib.js";
/**just reuse the uniform buffers for now*/
export class PassInstance extends Pass {
    constructor(_raw) {
        super(_raw.state, _raw.type);
        this._raw = _raw;
        this._overrides = {};
        for (const name in _raw.samplerTextures) {
            this.setTexture(name, ..._raw.samplerTextures[name]);
        }
    }
    setUniform(name, member, value) {
        var _a;
        if (!this._overrides[name]) {
            const block = shaderLib.getShaderMeta(this.state.shader).blocks[name];
            const view = super.createUniformBuffer(name);
            view.set(this._raw.uniformBuffers[name].source);
            (_a = this.descriptorSet) === null || _a === void 0 ? void 0 : _a.bindBuffer(block.binding, view.buffer);
            this._uniformBuffers[name] = view;
            this._overrides[name] = true;
        }
        super.setUniform(name, member, value);
    }
    createUniformBuffer(name) {
        return this._raw.uniformBuffers[name];
    }
}
