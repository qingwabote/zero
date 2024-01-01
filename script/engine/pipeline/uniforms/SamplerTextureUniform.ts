import { DescriptorType, ShaderStageFlagBits } from "gfx";
import { Uniform } from "../../core/render/pipeline/Uniform.js";

export class SamplerTextureUniform extends Uniform {
    static readonly definition = {
        type: DescriptorType.SAMPLER_TEXTURE,
        stageFlags: ShaderStageFlagBits.FRAGMENT
    };
}