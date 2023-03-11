import { BufferUsageFlagBits } from "./core/gfx/Buffer.js";
import DescriptorSet, { DescriptorSet_ReadOnly } from "./core/gfx/DescriptorSet.js";
import { PassState } from "./core/gfx/Pipeline.js";
import { Sampler } from "./core/gfx/Sampler.js";
import Texture from "./core/gfx/Texture.js";
import BufferView from "./core/render/buffers/BufferView.js";
import Pass from "./core/render/Pass.js";
import PassPhase from "./core/render/PassPhase.js";
import ShaderLib from "./core/ShaderLib.js";

function type2Length(type: string): number {
    switch (type) {
        case "vec4":
            return 4;
        case "mat4":
            return 16;

        default:
            throw new Error(`unsupported uniform type: ${type}`);
    }
}

export default class PassImpl implements Pass {
    get state(): PassState {
        return this._state;
    }

    private _descriptorSet?: DescriptorSet;
    get descriptorSet(): DescriptorSet_ReadOnly | undefined {
        return this._descriptorSet;
    }

    get phase(): PassPhase {
        return this._phase;
    }

    private _views: Record<string, BufferView> = {};

    constructor(private _state: PassState, private _phase = PassPhase.DEFAULT) { }

    setUniform(name: string, member: string, value: ArrayLike<number>) {
        const block = this._state.shader.info.meta.blocks[name];
        let offset = 0;
        for (const mem of block.members!) {
            if (mem.name == member) {
                break;
            }
            offset += type2Length(mem.type);
        }
        let view = this._views[name]
        if (!view) {
            let length = block.members!.reduce((acc, mem) => acc + type2Length(mem.type), 0);
            view = new BufferView('Float32', BufferUsageFlagBits.UNIFORM, length);
            this._descriptorSet = this._descriptorSet || this.createDescriptorSet();
            this._descriptorSet.bindBuffer(block.binding, view.buffer);
            this._views[name] = view
        }
        view.set(value, offset);
    }

    bindTexture(binding: number, texture: Texture, sampler: Sampler): void {
        this._descriptorSet = this._descriptorSet || this.createDescriptorSet();
        this._descriptorSet.bindTexture(binding, texture, sampler);
    }

    update() {
        for (const name in this._views) {
            this._views[name].update();
        }
    }

    private createDescriptorSet() {
        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(ShaderLib.instance.getDescriptorSetLayout(this._state.shader));
        return descriptorSet;
    }
}