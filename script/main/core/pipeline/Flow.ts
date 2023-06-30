import CommandBuffer from "../gfx/CommandBuffer.js";
import DescriptorSet from "../gfx/DescriptorSet.js";
import { Framebuffer } from "../gfx/Framebuffer.js";
import { ClearFlagBits, PipelineLayout } from "../gfx/Pipeline.js";
import RenderPass from "../gfx/RenderPass.js";
import { ImageLayout, LOAD_OP, SampleCountFlagBits, TextureUsageBits } from "../gfx/info.js";
import shaderLib from "../shaderLib.js";
import Stage from "./Stage.js";
import Uniform from "./Uniform.js";

export default class Flow {
    readonly framebuffer: Framebuffer;

    private _drawCalls: number = 0;
    get drawCalls() {
        return this._drawCalls;
    }

    readonly globalDescriptorSet: DescriptorSet;

    private _uniforms: Uniform[] = [];

    private _globalPipelineLayout: PipelineLayout;

    private _clearFlag2renderPass: Record<string, RenderPass> = {};

    constructor(readonly stages: readonly Stage[], samples: SampleCountFlagBits = SampleCountFlagBits.SAMPLE_COUNT_1) {
        const uniforms: Set<new () => Uniform> = new Set;
        for (const stage of stages) {
            for (const uniform of stage.uniforms) {
                uniforms.add(uniform);
            }
        }

        const descriptorSetLayoutInfo = new gfx.DescriptorSetLayoutInfo;
        for (const uniform of uniforms) {
            const instance = new uniform;
            descriptorSetLayoutInfo.bindings.add(shaderLib.createDescriptorSetLayoutBinding(instance.definition))
            this._uniforms.push(instance);
        }

        const descriptorSetLayout = device.createDescriptorSetLayout();
        (descriptorSetLayout as any).name = "global descriptorSetLayout";
        descriptorSetLayout.initialize(descriptorSetLayoutInfo);

        const pipelineLayoutInfo = new gfx.PipelineLayoutInfo;
        pipelineLayoutInfo.layouts.add(descriptorSetLayout);
        const pipelineLayout = device.createPipelineLayout();
        pipelineLayout.initialize(pipelineLayoutInfo);
        this._globalPipelineLayout = pipelineLayout;

        const globalDescriptorSet = device.createDescriptorSet();
        globalDescriptorSet.initialize(descriptorSetLayout);
        this.globalDescriptorSet = globalDescriptorSet;

        const framebufferInfo = new gfx.FramebufferInfo;
        if (samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
            framebufferInfo.colorAttachments.add(device.swapchain.colorTexture);
        } else {
            const colorAttachmentInfo = new gfx.TextureInfo;
            colorAttachmentInfo.samples = samples;
            colorAttachmentInfo.usage = TextureUsageBits.COLOR_ATTACHMENT | TextureUsageBits.TRANSIENT_ATTACHMENT;
            colorAttachmentInfo.width = zero.window.width;
            colorAttachmentInfo.height = zero.window.height;
            const colorAttachment = device.createTexture();
            colorAttachment.initialize(colorAttachmentInfo);
            framebufferInfo.colorAttachments.add(colorAttachment);
            framebufferInfo.resolveAttachments.add(device.swapchain.colorTexture);
        }

        const depthStencilAttachmentInfo = new gfx.TextureInfo;
        depthStencilAttachmentInfo.samples = samples;
        depthStencilAttachmentInfo.usage = TextureUsageBits.DEPTH_STENCIL_ATTACHMENT | TextureUsageBits.SAMPLED;
        depthStencilAttachmentInfo.width = zero.window.width;
        depthStencilAttachmentInfo.height = zero.window.height;
        const depthStencilAttachment = device.createTexture();
        depthStencilAttachment.initialize(depthStencilAttachmentInfo);
        framebufferInfo.depthStencilAttachment = depthStencilAttachment;

        framebufferInfo.renderPass = this.getRenderPass(ClearFlagBits.COLOR, samples);
        framebufferInfo.width = zero.window.width;
        framebufferInfo.height = zero.window.height;

        const framebuffer = device.createFramebuffer();
        framebuffer.initialize(framebufferInfo);
        this.framebuffer = framebuffer;
    }

    initialize() {
        for (const uniform of this._uniforms) {
            uniform.initialize();
        }
    }

    update() {
        zero.scene.update();

        for (const uniform of this._uniforms) {
            uniform.update();
        }
    }

    record(commandBuffer: CommandBuffer) {
        this._drawCalls = 0;

        const renderScene = zero.scene;
        for (let cameraIndex = 0; cameraIndex < renderScene.cameras.length; cameraIndex++) {
            const camera = renderScene.cameras[cameraIndex];
            const dynamicOffsets = new gfx.Uint32Vector;
            dynamicOffsets.add(shaderLib.sets.global.uniforms.Camera.size * cameraIndex);
            commandBuffer.bindDescriptorSet(this._globalPipelineLayout, shaderLib.sets.global.index, this.globalDescriptorSet, dynamicOffsets);
            for (const stage of this.stages) {
                if ((camera.visibilityFlags & stage.visibility) == 0) {
                    continue;
                }
                stage.record(commandBuffer, camera);
                this._drawCalls += stage.drawCalls;
            }
        }
    }

    getRenderPass(clearFlags: ClearFlagBits, samples = SampleCountFlagBits.SAMPLE_COUNT_1): RenderPass {
        const hash = `${clearFlags}${samples}`;
        let renderPass = this._clearFlag2renderPass[hash];
        if (!renderPass) {
            const info = new gfx.RenderPassInfo;
            if (samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
                const colorAttachmentDescription = new gfx.AttachmentDescription;
                colorAttachmentDescription.loadOp = clearFlags & ClearFlagBits.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
                colorAttachmentDescription.initialLayout = clearFlags & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC;
                colorAttachmentDescription.finalLayout = ImageLayout.PRESENT_SRC;
                info.colorAttachments.add(colorAttachmentDescription);
            } else {
                const colorAttachmentDescription = new gfx.AttachmentDescription;
                colorAttachmentDescription.loadOp = clearFlags & ClearFlagBits.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
                colorAttachmentDescription.initialLayout = clearFlags & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.COLOR_ATTACHMENT_OPTIMAL;
                colorAttachmentDescription.finalLayout = ImageLayout.COLOR_ATTACHMENT_OPTIMAL;
                info.colorAttachments.add(colorAttachmentDescription);
                const resolveAttachmentDescription = new gfx.AttachmentDescription;
                resolveAttachmentDescription.loadOp = clearFlags & ClearFlagBits.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
                resolveAttachmentDescription.initialLayout = clearFlags & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC;
                resolveAttachmentDescription.finalLayout = ImageLayout.PRESENT_SRC;
                info.resolveAttachments.add(resolveAttachmentDescription);
            }
            info.depthStencilAttachment.loadOp = clearFlags & ClearFlagBits.DEPTH ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
            info.depthStencilAttachment.initialLayout = clearFlags & ClearFlagBits.DEPTH ? ImageLayout.UNDEFINED : ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
            info.depthStencilAttachment.finalLayout = ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
            info.samples = samples;
            renderPass = device.createRenderPass();
            renderPass.initialize(info);
            this._clearFlag2renderPass[hash] = renderPass;
        }
        return renderPass;
    }
}