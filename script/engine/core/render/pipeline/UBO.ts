import { device } from "boot";
import { Buffer, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Parameters } from "./Parameters.js";

interface UBODefinition {
    type: DescriptorType;
    stageFlags: ShaderStageFlagBits;
}

export abstract class UBO {
    static readonly definition: UBODefinition;

    static align(size: number) {
        const alignment = device.capabilities.uniformBufferOffsetAlignment;
        return Math.ceil(size / alignment) * alignment;
    }

    abstract get buffer(): Buffer;

    get range(): number { return 0 };

    dynamicOffset(paramm: Parameters): number { return -1 };

    constructor(protected _visibilities: number) { }

    abstract update(dumping: boolean): void;
}