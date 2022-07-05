import { Format } from "./gfx.js";

export enum ShaderStageFlags {
    VERTEX = 0x1,
    FRAGMENT = 0x10,
    ALL = 0x3f,
}

export interface ShaderInfo {
    readonly name: string;
    readonly stages: ShaderStage[]
}

export interface ShaderStage {
    readonly type: ShaderStageFlags,
    readonly source: string,
}

// export interface Attribute {
//     name: string
//     format: Format
//     location: number
// }

export default abstract class Shader {
    protected _info: ShaderInfo;

    // abstract get attributes(): Attribute[];

    constructor(info: ShaderInfo) {
        this._info = info;
    }
}