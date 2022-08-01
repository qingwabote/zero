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
    constructor(info) {
        const vertexStage = info.stages.find(stage => stage.type == ShaderStageFlags.VERTEX);
        const matches = vertexStage.source.matchAll(/layout\s*\(\s*location\s*=\s*(\d)\s*\)\s*in\s*\w+\s*(\w+)/g);
        for (const match of matches) {
            this._attributes[match[2]] = { location: parseInt(match[1]) };
        }
        this._info = info;
    }
}
//# sourceMappingURL=Shader.js.map