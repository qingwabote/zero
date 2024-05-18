import { BufferUsageFlagBits, DescriptorSet, DescriptorSetLayout, PassState, Sampler, Texture } from "gfx";
import { getSampler } from "../../sc.js";
import { shaderLib } from "../../shaderLib.js";
import { BufferView } from "../BufferView.js";
import { UniformSource } from "../UniformSource.js";

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

export class Pass implements UniformSource {
    static Pass(state: PassState, type = 'default') {
        const pass = new Pass(state, type);
        pass.initialize();
        return pass;
    }

    private _descriptorSetLayout?: DescriptorSetLayout | null = undefined;

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

    protected constructor(readonly state: PassState, readonly type: string) { }

    protected initialize() { }

    hasProperty(member: string): boolean {
        const block = shaderLib.getShaderMeta(this.state.shader).blocks['Props'];
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
        const instance = new Pass(this.state, this.type);
        for (const name in this.samplerTextures) {
            instance.setTexture(name, ...this.samplerTextures[name]);
        }
        for (const name in this.properties) {
            instance.setProperty(name, this.properties[name])
        }
        return instance;
    }

    getDescriptorSetLayout(): DescriptorSetLayout | null {
        if (this._descriptorSetLayout != undefined) {
            return this._descriptorSetLayout;
        }
        return this._descriptorSetLayout = shaderLib.getDescriptorSetLayout(this.state.shader, shaderLib.sets.material.index);
    }

    createUniformBuffers(descriptorSet: DescriptorSet): BufferView[] {
        const block = shaderLib.getShaderMeta(this.state.shader).blocks['Props'];
        if (!block) {
            return [];
        }

        const view = this.createUniformBuffer('Props');
        descriptorSet.bindBuffer(block.binding, view.buffer);
        return [view];
    }

    fillBuffers(buffers: BufferView[]) {
        const block = shaderLib.getShaderMeta(this.state.shader).blocks['Props'];
        let offset = 0;
        for (const mem of block.members!) {
            if (this._properties_dirty.get(mem.name)) {
                buffers[0].set(this._properties[mem.name], offset);
            }
            offset += type2Length(mem.type);
        }
        this._properties_dirty.clear();
    }

    bindTextures(descriptorSet: DescriptorSet) {
        for (const name of this._samplerTextures_dirty.keys()) {
            const binding = shaderLib.getShaderMeta(this.state.shader).samplerTextures[name].binding;
            descriptorSet.bindTexture(binding, ...this._samplerTextures[name]);
        }
        this._samplerTextures_dirty.clear();
    }

    protected createUniformBuffer(name: string): BufferView {
        const block = shaderLib.getShaderMeta(this.state.shader).blocks[name];
        let length = block.members!.reduce((acc, mem) => acc + type2Length(mem.type), 0);
        return new BufferView('Float32', BufferUsageFlagBits.UNIFORM, length);
    }
}