import BufferView from "./core/scene/buffers/BufferView.js";
import Pass from "./core/scene/Pass.js";

export default class PassInstance extends Pass {
    private _overrides: Record<string, boolean> = {};
    private _raw: Pass;

    constructor(raw: Pass) {
        super(raw.state, raw.type);
        for (const name in raw.samplerTextures) {
            this.setTexture(name, ...raw.samplerTextures[name]);
        }
        this._raw = raw;
    }

    setUniform(name: string, member: string, value: ArrayLike<number>): void {
        if (!this._overrides[name]) {
            const block = this.state.shader.info.meta.blocks[name];
            const view = super.createUniformBuffer(name);
            view.set(this._raw.uniformBuffers[name].data);
            this._descriptorSet?.bindBuffer(block.binding, view.buffer);
            this._uniformBuffers[name] = view;
        }
        super.setUniform(name, member, value);
    }

    protected override createUniformBuffer(name: string): BufferView {
        return this._raw.uniformBuffers[name];
    }
}