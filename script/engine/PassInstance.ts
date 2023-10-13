import { BufferViewWritable } from "./core/render/scene/buffers/BufferViewWritable.js";
import { Pass } from "./core/render/scene/Pass.js";
import { shaderLib } from "./core/shaderLib.js";

/**just reuse the uniform buffers for now*/
export class PassInstance extends Pass {
    private _overrides: Record<string, boolean> = {};
    private _raw: Pass;

    constructor(raw: Pass) {
        super(raw.state, raw.type, (self: this) => self._raw = raw);
        for (const name in raw.samplerTextures) {
            this.setTexture(name, ...raw.samplerTextures[name]);
        }
        this._raw = raw;
    }

    override setUniform(name: string, member: string, value: ArrayLike<number>): void {
        if (!this._overrides[name]) {
            const block = shaderLib.getShaderMeta(this.state.shader).blocks[name];
            const view = super.createUniformBuffer(name);
            view.set(this._raw.uniformBuffers[name].source);
            this.descriptorSet?.bindBuffer(block.binding, view.buffer);
            this._uniformBuffers[name] = view;
            this._overrides[name] = true;
        }
        super.setUniform(name, member, value);
    }

    protected override createUniformBuffer(name: string): BufferViewWritable {
        return this._raw.uniformBuffers[name];
    }
}