import { ShaderInfo } from "./info.js";

export interface Shader {
    get info(): ShaderInfo;
    initialize(info: ShaderInfo): boolean;
}