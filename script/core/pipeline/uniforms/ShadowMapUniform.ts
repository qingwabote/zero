import { DescriptorSetLayoutBinding, DescriptorType } from "../../gfx/DescriptorSetLayout.js";
import { Filter } from "../../gfx/Sampler.js";
import shaders from "../../shaders.js";
import PipelineUniform from "../PipelineUniform.js";
import ShadowMapStage from "../stages/ShadowMapStage.js";

const shadowMap = {
    type: DescriptorType.SAMPLER_TEXTURE,
    binding: 3,
}

const descriptorSetLayoutBinding = shaders.createDescriptorSetLayoutBinding(shadowMap);

const sampler = gfx.createSampler();
sampler.initialize({ magFilter: Filter.NEAREST, minFilter: Filter.NEAREST });

export default class ShadowMapUniform implements PipelineUniform {
    get descriptorSetLayoutBinding(): DescriptorSetLayoutBinding {
        return descriptorSetLayoutBinding;
    }

    initialize(): void {
        const shadowMapStage = zero.renderFlow.stages.find((stage) => { return stage instanceof ShadowMapStage }) as ShadowMapStage;
        zero.renderFlow.globalDescriptorSet.bindTexture(shadowMap.binding, shadowMapStage.framebuffer.info.depthStencilAttachment, sampler);
    }

    update(): void { }
}