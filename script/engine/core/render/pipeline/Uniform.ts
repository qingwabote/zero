import { DescriptorType, ShaderStageFlagBits } from "gfx";
import { Context } from "../Context.js";

interface UniformDefinition {
    type: DescriptorType;
    stageFlags: ShaderStageFlagBits;
}

export class Uniform {
    static readonly definition: UniformDefinition;
    constructor(protected _context: Context) { };
    update(): void { };
}