import { Buffer, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Parameters } from "./Parameters.js";

interface UniformDefinition {
    type: DescriptorType;
    stageFlags: ShaderStageFlagBits;
}

export abstract class UniformBufferObject {
    static readonly definition: UniformDefinition;
    abstract get buffer(): Buffer;
    get range(): number { return 0 };
    dynamicOffset(paramm: Parameters): number { return -1 };
    update(): void { };
}