import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import DescriptorSet, { DescriptorSet_ReadOnly } from "../gfx/DescriptorSet.js";
import { PassState } from "../gfx/Pipeline.js";
import { Sampler } from "../gfx/Sampler.js";
import Texture from "../gfx/Texture.js";
import samplers from "../samplers.js";
import ShaderLib from "../ShaderLib.js";
import BufferView from "./buffers/BufferView.js";

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

export default class Pass {
    get state(): PassState {
        return this._state;
    }

    protected _descriptorSet?: DescriptorSet;
    get descriptorSet(): DescriptorSet_ReadOnly | undefined {
        return this._descriptorSet;
    }

    get flag(): number {
        return this._flag;
    }

    protected _uniforms: Record<string, BufferView> = {};
    get uniforms(): Readonly<Record<string, BufferView>> {
        return this._uniforms;
    }

    private _textures: Record<string, [Texture, Sampler]> = {};
    public get textures(): Readonly<Record<string, [Texture, Sampler]>> {
        return this._textures;
    }

    constructor(private _state: PassState, private _flag = 0) { }

    initialize() {
        const descriptorSetLayout = ShaderLib.instance.getDescriptorSetLayout(this._state.shader);
        if (descriptorSetLayout.bindings.length) {
            const descriptorSet = gfx.createDescriptorSet();
            descriptorSet.initialize(descriptorSetLayout);

            const blocks = this._state.shader.info.meta.blocks;
            for (const name in blocks) {
                const block = blocks[name];
                if (block.set < ShaderLib.sets.material.set) {
                    continue;
                }
                const view = this.createUniform(name);
                descriptorSet.bindBuffer(block.binding, view.buffer);
                this._uniforms[name] = view;
            }
            this._descriptorSet = descriptorSet;
        }
    }

    setUniform(name: string, member: string, value: ArrayLike<number>) {
        const block = this._state.shader.info.meta.blocks[name];
        let offset = 0;
        for (const mem of block.members!) {
            if (mem.name == member) {
                break;
            }
            offset += type2Length(mem.type);
        }
        let view = this._uniforms[name]
        view.set(value, offset);
    }

    setTexture(name: string, texture: Texture, sampler: Sampler = samplers.get()): void {
        const binding = this._state.shader.info.meta.samplerTextures[name].binding;
        this._descriptorSet?.bindTexture(binding, texture, sampler);
        this._textures[name] = [texture, sampler];
    }

    update() {
        for (const name in this._uniforms) {
            this._uniforms[name].update();
        }
    }

    protected createUniform(name: string): BufferView {
        const block = this._state.shader.info.meta.blocks[name];
        let length = block.members!.reduce((acc, mem) => acc + type2Length(mem.type), 0);
        return new BufferView('Float32', BufferUsageFlagBits.UNIFORM, length);
    }
}