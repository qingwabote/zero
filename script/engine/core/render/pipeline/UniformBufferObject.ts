import { Buffer, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Context } from "../Context.js";

interface UniformDefinition {
    type: DescriptorType;
    stageFlags: ShaderStageFlagBits;
}

export abstract class UniformBufferObject {
    static readonly definition: UniformDefinition;
    abstract get buffer(): Buffer;
    get range(): number { return 0 };
    dynamicOffset(context: Context): number { return -1 };
    update(): void { };
}