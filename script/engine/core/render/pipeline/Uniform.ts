import { DescriptorType, ShaderStageFlagBits } from "gfx";
import { Context } from "../Context.js";

interface UniformDefinition {
    type: DescriptorType;
    stageFlags: ShaderStageFlagBits;
}

export class Uniform {
    static readonly definition: UniformDefinition;
    get dynamicOffset(): number { return -1 };
    constructor(protected _context: Context, protected _binding: number) { };
    update(): void { };
}