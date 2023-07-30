import { DescriptorType, Filter, ShaderStageFlagBits } from "gfx-main";
import { Zero } from "../../core/Zero.js";
import { Uniform } from "../../core/pipeline/Uniform.js";
import { samplers } from "../../core/samplers.js";
import { ShadowUniform } from "./ShadowUniform.js";

const shadowMap = {
    type: DescriptorType.SAMPLER_TEXTURE,
    stageFlags: ShaderStageFlagBits.FRAGMENT,
    binding: 3,
} as const

export class ShadowMapUniform implements Uniform {
    readonly definition = shadowMap;

    initialize(): void {
        const shadowStage = Zero.instance.flow.stages.find((stage) => { return stage.uniforms.indexOf(ShadowUniform) != -1 })!;
        Zero.instance.flow.globalDescriptorSet.bindTexture(
            shadowMap.binding,
            shadowStage.framebuffer.info.depthStencilAttachment,
            samplers.get(Filter.NEAREST, Filter.NEAREST)
        );
    }

    update(): void { }
}