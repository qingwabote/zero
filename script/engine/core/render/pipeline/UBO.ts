import { device } from "boot";
import { Buffer, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Data } from "./Data.js";
import { Parameters } from "./Parameters.js";

interface UBODefinition {
    type: DescriptorType;
    stageFlags: ShaderStageFlagBits;
    size: number;
}

export abstract class UBO {
    static readonly definition: UBODefinition;

    static align(size: number) {
        const alignment = device.capabilities.uniformBufferOffsetAlignment;
        return Math.ceil(size / alignment) * alignment;
    }

    abstract get buffer(): Buffer;

    constructor(
        protected readonly _data: Data,
        protected readonly _visibilities: number
    ) { }

    dynamicOffset(paramm: Parameters): number { return -1 };

    abstract update(dumping: boolean): void;
}