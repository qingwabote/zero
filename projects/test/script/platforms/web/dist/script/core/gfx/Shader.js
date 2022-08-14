import { DescriptorType } from "./Pipeline.js";
export var ShaderStageFlags;
(function (ShaderStageFlags) {
    ShaderStageFlags[ShaderStageFlags["VERTEX"] = 1] = "VERTEX";
    ShaderStageFlags[ShaderStageFlags["FRAGMENT"] = 16] = "FRAGMENT";
    ShaderStageFlags[ShaderStageFlags["ALL"] = 63] = "ALL";
})(ShaderStageFlags || (ShaderStageFlags = {}));
export default class Shader {
    _info;
    get info() {
        return this._info;
    }
    _attributes = {};
    get attributes() {
        return this._attributes;
    }
    _descriptorSetLayout = { bindings: [] };
    get descriptorSetLayout() {
        return this._descriptorSetLayout;
    }
    _samplerTextures = {};
    _blocks = {};
    initialize(info) {
        this._info = info;
        const vertexStage = info.stages.find(stage => stage.type == ShaderStageFlags.VERTEX);
        const matches = vertexStage.source.matchAll(/layout\s*\(\s*location\s*=\s*(\d)\s*\)\s*in\s*\w+\s*(\w+)/g);
        for (const match of matches) {
            this._attributes[match[2]] = { location: parseInt(match[1]) };
        }
        const compiled = [];
        for (const stage of info.stages) {
            const src = stage.source.replace(/layout\s*\(\s*set\s*=\s*(\d)\s*,\s*binding\s*=\s*(\d)\s*\)\s*uniform\s*(\w*)\s+(\w+)/g, this.compileUniform.bind(this));
            compiled.push({ type: stage.type, source: src });
        }
        this.compileShader(compiled, this._blocks, this._samplerTextures);
    }
    compileUniform(content, set, binding, type, name) {
        if (!type) {
            // this._descriptorSetLayout.bindings.push({ binding: parseInt(binding), descriptorType: DescriptorType.UNIFORM_BUFFER, count: 1 })
            this._blocks[name] = { set: parseInt(set), binding: parseInt(binding) };
        }
        else if (type == 'sampler2D') {
            this._descriptorSetLayout.bindings.push({ binding: parseInt(binding), descriptorType: DescriptorType.SAMPLER_TEXTURE, count: 1 });
            this._samplerTextures[name] = { set: parseInt(set), binding: parseInt(binding) };
        }
        return content;
    }
}
//# sourceMappingURL=Shader.js.map