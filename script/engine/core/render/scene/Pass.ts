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

    private _properties_dirty: Map<string, boolean> = new Map;
    private _properties: Record<string, ArrayLike<number>> = {};
    public get properties(): Readonly<Record<string, ArrayLike<number>>> {
        return this._properties;
    }

    private _samplerTextures_dirty: Map<string, boolean> = new Map;
    private _samplerTextures: Record<string, [Texture, Sampler]> = {};
    public get samplerTextures(): Readonly<Record<string, [Texture, Sampler]>> {
        return this._samplerTextures;
    }

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
                const view = this.createUniformBuffer('Props');
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

        for (const mem of block.members!) {
            if (mem.name == member) {
                return true;
            }
        }

        return false;
    }

    setProperty(member: string, value: ArrayLike<number>) {
        this._properties[member] = value;
        this._properties_dirty.set(member, true);
    }

    setTexture(name: string, texture: Texture, sampler: Sampler = getSampler()): void {
        this._samplerTextures[name] = [texture, sampler];
        this._samplerTextures_dirty.set(name, true);
    }

    instantiate() {
        const instance = Pass.Pass(this.state, this.type);
        for (const name in this.samplerTextures) {
            instance.setTexture(name, ...this.samplerTextures[name]);
        }
        for (const name in this.properties) {
            instance.setProperty(name, this.properties[name])
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

            if (this._propsBuffer) {
                const block = shaderLib.getShaderMeta(this.state.shader!).blocks['Props'];
                let offset = 0;
                for (const mem of block.members!) {
                    if (this._properties_dirty.get(mem.name)) {
                        this._propsBuffer.set(this._properties[mem.name], offset);
                    }
                    offset += type2Length(mem.type);
                }
                this._propsBuffer.update();
                this._properties_dirty.clear();
            }
        }
    }

    protected createUniformBuffer(name: string): BufferView {
        const block = shaderLib.getShaderMeta(this.state.shader!).blocks[name];
        let length = block.members!.reduce((acc, mem) => acc + type2Length(mem.type), 0);
        return new BufferView('Float32', BufferUsageFlagBits.UNIFORM, length);
    }
}