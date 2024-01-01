import { DescriptorType, Filter, ShaderStageFlagBits, Texture } from "gfx";
import { Context } from "../../core/render/Context.js";
import { Uniform } from "../../core/render/pipeline/Uniform.js";
import { getSampler } from "../../core/sc.js";

export class SamplerTextureUniform extends Uniform {
    static readonly definition = {
        type: DescriptorType.SAMPLER_TEXTURE,
        stageFlags: ShaderStageFlagBits.FRAGMENT
    };

    constructor(context: Context, binding: number, texture: Texture) {
        super(context, binding);

        this._context.descriptorSet.bindTexture(
            binding,
            texture,
            getSampler(Filter.NEAREST, Filter.NEAREST)
        );
    }
}