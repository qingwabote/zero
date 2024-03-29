import { device } from "boot";
import { BufferUsageFlagBits, DescriptorSet, DescriptorSetLayout, PassState, Sampler, Texture } from "gfx";
import { getSampler } from "../../sc.js";
import { shaderLib } from "../../shaderLib.js";
import { BufferView } from "../BufferView.js";

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

export class Pass {
    static Pass(state: PassState, type = 'default') {
        const pass = new Pass(state, type);
        pass.initialize();
        return pass;
    }

    readonly descriptorSetLayout: DescriptorSetLayout;
    readonly descriptorSet?: DescriptorSet = undefined;

    protected _uniformBuffers: Record<string, BufferView> = {};
    get uniformBuffers(): Readonly<Record<string, BufferView>> {
        return this._uniformBuffers;
    }

    private _samplerTextures: Record<string, [Texture, Sampler]> = {};
    public get samplerTextures(): Readonly<Record<string, [Texture, Sampler]>> {
        return this._samplerTextures;
    }

    protected constructor(readonly state: PassState, readonly type: string) {
        const descriptorSetLayout = shaderLib.getDescriptorSetLayout(this.state.shader, shaderLib.sets.material.index);
        if (descriptorSetLayout.info.bindings.size()) {
            this.descriptorSet = device.createDescriptorSet(descriptorSetLayout);
        }
        this.descriptorSetLayout = descriptorSetLayout;
    }

    protected initialize() {
        if (this.descriptorSet) {
            const blocks = shaderLib.getShaderMeta(this.state.shader).blocks;
            for (const name in blocks) {
                const block = blocks[name];
                if (block.set != shaderLib.sets.material.index) {
                    continue;
                }
                const view = this.createUniformBuffer(name);
                this.descriptorSet.bindBuffer(block.binding, view.buffer);
                this._uniformBuffers[name] = view;
            }
        }
    }

    hasUniform(name: string, member: string): boolean {
        const block = shaderLib.getShaderMeta(this.state.shader).blocks[name];
        if (!block) {
            return false;
        }
        for (const mem of block.members!) {
            if (mem.name == member) {
                return true;
            }
        }
        return false;
    }

    setUniform(name: string, member: string, value: ArrayLike<number>) {
        const block = shaderLib.getShaderMeta(this.state.shader).blocks[name];
        let offset = 0;
        for (const mem of block.members!) {
            if (mem.name == member) {
                break;
            }
            offset += type2Length(mem.type);
        }
        this._uniformBuffers[name].set(value, offset);
    }

    setTexture(name: string, texture: Texture, sampler: Sampler = getSampler()): void {
        const binding = shaderLib.getShaderMeta(this.state.shader).samplerTextures[name].binding;
        this.descriptorSet?.bindTexture(binding, texture, sampler);
        this._samplerTextures[name] = [texture, sampler];
    }

    update() {
        for (const name in this._uniformBuffers) {
            this._uniformBuffers[name].update();
        }
    }

    protected createUniformBuffer(name: string): BufferView {
        const block = shaderLib.getShaderMeta(this.state.shader).blocks[name];
        let length = block.members!.reduce((acc, mem) => acc + type2Length(mem.type), 0);
        return new BufferView('Float32', BufferUsageFlagBits.UNIFORM, length);
    }
}