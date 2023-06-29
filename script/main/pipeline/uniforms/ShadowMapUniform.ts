import { DescriptorType } from "../../core/gfx/DescriptorSetLayout.js";
import { Filter } from "../../core/gfx/Sampler.js";
import { ShaderStageFlagBits } from "../../core/gfx/info.js";
import Uniform from "../../core/pipeline/Uniform.js";
import samplers from "../../core/samplers.js";
import ShadowUniform from "./ShadowUniform.js";

const shadowMap = {
    type: DescriptorType.SAMPLER_TEXTURE,
    stageFlags: ShaderStageFlagBits.FRAGMENT,
    binding: 3,
} as const

export default class ShadowMapUniform implements Uniform {
    readonly definition = shadowMap;

    initialize(): void {
        const shadowStage = zero.flow.stages.find((stage) => { return stage.uniforms.indexOf(ShadowUniform) != -1 })!;
        zero.flow.globalDescriptorSet.bindTexture(
            shadowMap.binding,
            shadowStage.framebuffer.info.depthStencilAttachment,
            samplers.get({ magFilter: Filter.NEAREST, minFilter: Filter.NEAREST })
        );
    }

    update(): void { }
}