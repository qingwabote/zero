import { PassState } from "./core/gfx/Pipeline.js";
import BufferView from "./core/scene/buffers/BufferView.js";
import Pass from "./core/scene/Pass.js";

export default class PassInstance extends Pass {
    private _overrides: Record<string, boolean> = {};
    private _raw: Pass;

    constructor(raw: Pass, state?: PassState) {
        super(state || raw.state);
        for (const name in raw.textures) {
            this.setTexture(name, ...raw.textures[name]);
        }
        this._raw = raw;
    }

    setUniform(name: string, member: string, value: ArrayLike<number>): void {
        if (!this._overrides[name]) {
            const block = this.state.shader.info.meta.blocks[name];
            const view = super.createUniform(name);
            view.set(this._raw.uniforms[name].data);
            this._descriptorSet?.bindBuffer(block.binding, view.buffer);
            this._uniforms[name] = view;
        }
        super.setUniform(name, member, value);
    }

    protected override createUniform(name: string): BufferView {
        return this._raw.uniforms[name];
    }
}