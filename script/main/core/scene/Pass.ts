import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import DescriptorSet from "../gfx/DescriptorSet.js";
import { PassState, PassStateInfo } from "../gfx/Pipeline.js";
import { Sampler } from "../gfx/Sampler.js";
import Texture from "../gfx/Texture.js";
import samplers from "../samplers.js";
import ShaderLib from "../ShaderLib.js";
import BufferViewWritable from "./buffers/BufferViewWritable.js";

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
    readonly state: PassState;

    readonly descriptorSet?: DescriptorSet;

    protected _uniformBuffers: Record<string, BufferViewWritable> = {};
    get uniformBuffers(): Readonly<Record<string, BufferViewWritable>> {
        return this._uniformBuffers;
    }

    private _samplerTextures: Record<string, [Texture, Sampler]> = {};
    public get samplerTextures(): Readonly<Record<string, [Texture, Sampler]>> {
        return this._samplerTextures;
    }

    constructor(stateOrInfo: PassState | PassStateInfo, readonly type = 0, getThis?: (self: any) => void) {
        getThis && getThis(this);
        if (stateOrInfo instanceof PassState) {
            this.state = stateOrInfo;
        } else {
            this.state = new PassState(stateOrInfo);
        }
        const descriptorSetLayout = ShaderLib.instance.getMaterialDescriptorSetLayout(this.state.shader);
        if (descriptorSetLayout.bindings.length) {
            const descriptorSet = gfx.createDescriptorSet();
            descriptorSet.initialize(descriptorSetLayout);

            const blocks = this.state.shader.info.meta.blocks;
            for (const name in blocks) {
                const block = blocks[name];
                if (block.set != ShaderLib.sets.material.index) {
                    continue;
                }
                const view = this.createUniformBuffer(name);
                descriptorSet.bindBuffer(block.binding, view.buffer);
                this._uniformBuffers[name] = view;
            }
            this.descriptorSet = descriptorSet;
        }
    }

    setUniform(name: string, member: string, value: ArrayLike<number>) {
        const block = this.state.shader.info.meta.blocks[name];
        let offset = 0;
        for (const mem of block.members!) {
            if (mem.name == member) {
                break;
            }
            offset += type2Length(mem.type);
        }
        this._uniformBuffers[name].set(value, offset);
    }

    setTexture(name: string, texture: Texture, sampler: Sampler = samplers.get()): void {
        const binding = this.state.shader.info.meta.samplerTextures[name].binding;
        this.descriptorSet?.bindTexture(binding, texture, sampler);
        this._samplerTextures[name] = [texture, sampler];
    }

    update() {
        for (const name in this._uniformBuffers) {
            this._uniformBuffers[name].update();
        }
    }

    protected createUniformBuffer(name: string): BufferViewWritable {
        const block = this.state.shader.info.meta.blocks[name];
        let length = block.members!.reduce((acc, mem) => acc + type2Length(mem.type), 0);
        return new BufferViewWritable('Float32', BufferUsageFlagBits.UNIFORM, length);
    }
}