import { device } from "boot";
import { Buffer, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Data } from "./Data.js";

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

    abstract get range(): number;

    get dynamicOffset(): number {
        return -1;
    }

    constructor(
        protected readonly _data: Data,
        protected readonly _visibilities: number
    ) { }

    abstract update(dumping: boolean): void;
}