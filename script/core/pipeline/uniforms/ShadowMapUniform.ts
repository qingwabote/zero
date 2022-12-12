import { DescriptorSetLayoutBinding, DescriptorType } from "../../gfx/DescriptorSetLayout.js";
import { Filter } from "../../gfx/Sampler.js";
import shaders from "../../shaders.js";
import ShadowmapPhase from "../phases/ShadowmapPhase.js";
import PipelineUniform from "../PipelineUniform.js";

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
        const shadowmapPhase = zero.renderFlow.renderPhases.find((phase) => { return phase instanceof ShadowmapPhase }) as ShadowmapPhase;
        zero.renderFlow.globalDescriptorSet.bindTexture(shadowMap.binding, shadowmapPhase.framebuffer.info.depthStencilAttachment, sampler);
    }

    update(): void { }
}