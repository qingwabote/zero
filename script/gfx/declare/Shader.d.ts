import { ShaderInfo } from "./info.js";

export declare class Shader {
    get info(): ShaderInfo;
    private constructor(...args);
    initialize(info: ShaderInfo): boolean;
}