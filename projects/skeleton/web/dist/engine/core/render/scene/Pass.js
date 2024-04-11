import { device } from "boot";
import { BufferUsageFlagBits } from "gfx";
import { getSampler } from "../../sc.js";
import { shaderLib } from "../../shaderLib.js";
import { BufferView } from "../BufferView.js";
function type2Length(type) {
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
    static Pass(state, type = 'default') {
        const pass = new Pass(state, type);
        pass.initialize();
        return pass;
    }
    get uniformBuffers() {
        return this._uniformBuffers;
    }
    get samplerTextures() {
        return this._samplerTextures;
    }
    constructor(state, type) {
        this.state = state;
        this.type = type;
        this.descriptorSet = undefined;
        this._uniformBuffers = {};
        this._samplerTextures = {};
        const descriptorSetLayout = shaderLib.getDescriptorSetLayout(this.state.shader, shaderLib.sets.material.index);
        if (descriptorSetLayout.info.bindings.size()) {
            this.descriptorSet = device.createDescriptorSet(descriptorSetLayout);
        }
        this.descriptorSetLayout = descriptorSetLayout;
    }
    initialize() {
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
    hasUniform(name, member) {
        const block = shaderLib.getShaderMeta(this.state.shader).blocks[name];
        if (!block) {
            return false;
        }
        for (const mem of block.members) {
            if (mem.name == member) {
                return true;
            }
        }
        return false;
    }
    setUniform(name, member, value) {
        const block = shaderLib.getShaderMeta(this.state.shader).blocks[name];
        let offset = 0;
        for (const mem of block.members) {
            if (mem.name == member) {
                break;
            }
            offset += type2Length(mem.type);
        }
        this._uniformBuffers[name].set(value, offset);
    }
    setTexture(name, texture, sampler = getSampler()) {
        var _a;
        const binding = shaderLib.getShaderMeta(this.state.shader).samplerTextures[name].binding;
        (_a = this.descriptorSet) === null || _a === void 0 ? void 0 : _a.bindTexture(binding, texture, sampler);
        this._samplerTextures[name] = [texture, sampler];
    }
    update() {
        for (const name in this._uniformBuffers) {
            this._uniformBuffers[name].update();
        }
    }
    createUniformBuffer(name) {
        const block = shaderLib.getShaderMeta(this.state.shader).blocks[name];
        let length = block.members.reduce((acc, mem) => acc + type2Length(mem.type), 0);
        return new BufferView('Float32', BufferUsageFlagBits.UNIFORM, length);
    }
}
