import { DescriptorSetLayoutBinding, DescriptorType } from "../../core/gfx/DescriptorSetLayout.js";
import { Filter } from "../../core/gfx/Sampler.js";
import Uniform from "../../core/render/Uniform.js";
import samplers from "../../core/samplers.js";
import ShaderLib from "../../core/ShaderLib.js";
import ShadowStage from "../stages/ShadowStage.js";

const shadowMap = {
    type: DescriptorType.SAMPLER_TEXTURE,
    binding: 3,
}

const descriptorSetLayoutBinding = ShaderLib.createDescriptorSetLayoutBinding(shadowMap);

export default class ShadowMapUniform implements Uniform {
    get descriptorSetLayoutBinding(): DescriptorSetLayoutBinding {
        return descriptorSetLayoutBinding;
    }

    initialize(): void {
        const shadowStage = zero.flow.stages.find((stage) => { return stage instanceof ShadowStage }) as ShadowStage;
        zero.flow.globalDescriptorSet.bindTexture(
            shadowMap.binding,
            shadowStage.framebuffer.info.depthStencilAttachment,
            samplers.get({ magFilter: Filter.NEAREST, minFilter: Filter.NEAREST })
        );
    }

    update(): void { }
}