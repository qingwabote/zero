import { ShaderInfo } from "./info.js";

export default interface Shader {
    get info(): ShaderInfo;
    initialize(info: ShaderInfo): boolean;
}