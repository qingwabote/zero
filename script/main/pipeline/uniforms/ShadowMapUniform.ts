import { DescriptorSetLayoutBinding, DescriptorType } from "../../gfx/DescriptorSetLayout.js";
import { Filter } from "../../gfx/Sampler.js";
import samplers from "../../render/samplers.js";
import ShaderLib from "../../ShaderLib.js";
import PipelineUniform from "../PipelineUniform.js";
import ShadowStage from "../stages/ShadowStage.js";

const shadowMap = {
    type: DescriptorType.SAMPLER_TEXTURE,
    binding: 3,
}

const descriptorSetLayoutBinding = ShaderLib.createDescriptorSetLayoutBinding(shadowMap);

export default class ShadowMapUniform implements PipelineUniform {
    get descriptorSetLayoutBinding(): DescriptorSetLayoutBinding {
        return descriptorSetLayoutBinding;
    }

    initialize(): void {
        const shadowStage = zero.renderFlow.stages.find((stage) => { return stage instanceof ShadowStage }) as ShadowStage;
        zero.renderFlow.globalDescriptorSet.bindTexture(
            shadowMap.binding,
            shadowStage.framebuffer.info.depthStencilAttachment,
            samplers.get({ magFilter: Filter.NEAREST, minFilter: Filter.NEAREST })
        );
    }

    update(): void { }
}