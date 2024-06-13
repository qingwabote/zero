import { Pass } from "../core/render/scene/Pass.js";
import { shaderLib } from "../core/shaderLib.js";
/**just reuse the uniform buffers for now*/
export class PassInstance extends Pass {
    static PassInstance(raw) {
        const instance = new PassInstance(raw);
        instance.initialize();
        return instance;
    }
    constructor(_raw) {
        super(_raw.state, _raw.type);
        this._raw = _raw;
        this._overrides = {};
        for (const name in _raw.samplerTextures) {
            this.setTexture(name, ..._raw.samplerTextures[name]);
        }
    }
    setProperty(member, value) {
        var _a;
        if (!this._overrides['Props']) {
            const block = shaderLib.getShaderMeta(this.state.shader).blocks['Props'];
            const view = super.createUniformBuffer('Props');
            view.set(this._raw.uniformBuffers['Props'].source);
            (_a = this.descriptorSet) === null || _a === void 0 ? void 0 : _a.bindBuffer(block.binding, view.buffer);
            this._uniformBuffers['Props'] = view;
            this._overrides['Props'] = true;
        }
        super.setProperty(member, value);
    }
    createUniformBuffer(name) {
        return this._raw.uniformBuffers[name];
    }
}
