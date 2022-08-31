import { Meta, ShaderStage } from "../shaders.js";


export interface ShaderInfo {
    readonly name: string;
    readonly stages: ShaderStage[];
    readonly meta: Meta;
}

export default interface Shader {
    get info(): ShaderInfo;
    initialize(info: ShaderInfo): void;
}