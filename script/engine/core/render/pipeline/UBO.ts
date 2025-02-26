import { device } from "boot";
import { Buffer, CommandBuffer, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Context } from "../Context.js";
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

    get range(): number {
        return 0;
    };

    dynamicOffset(context: Context, cameraIndex: number, flowLoopIndex: number): number {
        return -1;
    }

    constructor(
        protected readonly _data: Data,
        protected readonly _visibilities: number
    ) { }

    abstract upload(context: Context, commandBuffer: CommandBuffer, dumping: boolean): void;
}