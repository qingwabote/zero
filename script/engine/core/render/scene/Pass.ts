import { device } from "boot";
import { BufferUsageFlagBits, DescriptorSet, DescriptorSetLayout, PassState, Sampler, Texture, glsl } from "gfx";
import { getSampler } from "../../sc.js";
import { shaderLib } from "../../shaderLib.js";
import { BufferView } from "../BufferView.js";

export class Pass {
    static Pass(state: PassState, type = 'default') {
        const pass = new Pass(state, type);
        pass.initialize();
        return pass;
    }

    private _samplerTextures_dirty: Map<string, boolean> = new Map;
    private _samplerTextures: Record<string, [Texture, Sampler]> = {};

    readonly descriptorSetLayout: DescriptorSetLayout;
    readonly descriptorSet?: DescriptorSet;

    private _propsBuffer?: BufferView;

    protected constructor(readonly state: PassState, readonly type: string) {
        const descriptorSetLayout = shaderLib.getDescriptorSetLayout(state.shader!, shaderLib.sets.material.index);
        if (descriptorSetLayout.info.bindings.size()) {
            this.descriptorSet = device.createDescriptorSet(descriptorSetLayout);
        }
        this.descriptorSetLayout = descriptorSetLayout;
    }

    protected initialize() {
        if (this.descriptorSet) {
            const block = shaderLib.getShaderMeta(this.state.shader!).blocks['Props'];
            if (block) {
                const view = this.createUniformBuffer(block);
                this.descriptorSet.bindBuffer(block.binding, view.buffer);
                this._propsBuffer = view;
            }
        }
    }

    hasProperty(member: string): boolean {
        const block = shaderLib.getShaderMeta(this.state.shader!).blocks['Props'];
        if (!block) {
            return false;
        }

        if (member in block.members!) {
            return true;
        }

        return false;
    }

    getPropertyOffset(name: string): number {
        return shaderLib.getShaderMeta(this.state.shader!).blocks['Props']?.members![name]?.offset ?? -1;
    }

    setProperty(value: ArrayLike<number>, offset: number) {
        this._propsBuffer!.set(value, offset);
    }

    setTexture(name: string, texture: Texture, sampler: Sampler = getSampler()): void {
        this._samplerTextures[name] = [texture, sampler];
        this._samplerTextures_dirty.set(name, true);
    }

    instantiate() {
        const instance = Pass.Pass(this.state, this.type);
        for (const name in this._samplerTextures) {
            instance.setTexture(name, ...this._samplerTextures[name]);
        }
        if (this._propsBuffer) {
            instance.setProperty(this._propsBuffer.source, 0);
        }
        return instance;
    }

    upload() {
        if (this.descriptorSet) {
            for (const name of this._samplerTextures_dirty.keys()) {
                const binding = shaderLib.getShaderMeta(this.state.shader!).samplerTextures[name].binding;
                this.descriptorSet.bindTexture(binding, ...this._samplerTextures[name]);
            }
            this._samplerTextures_dirty.clear();

            this._propsBuffer?.update();
        }
    }

    protected createUniformBuffer(block: glsl.Uniform): BufferView {
        return new BufferView('Float32', BufferUsageFlagBits.UNIFORM, block.size);
    }
}