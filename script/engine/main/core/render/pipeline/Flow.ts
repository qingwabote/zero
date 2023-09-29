import { ClearFlagBits, CommandBuffer, DescriptorSet, DescriptorSetLayoutInfo, Framebuffer, FramebufferInfo, PipelineLayout, PipelineLayoutInfo, SampleCountFlagBits, TextureInfo, TextureUsageBits, Uint32Vector } from "gfx";
import { Zero } from "../../Zero.js";
import { device } from "../../impl.js";
import { shaderLib } from "../../shaderLib.js";
import { Root } from "../scene/Root.js";
import { Stage } from "./Stage.js";
import { Uniform } from "./Uniform.js";
import { getRenderPass } from "./rpc.js";

export class Flow {
    readonly framebuffer: Framebuffer;

    private _drawCalls: number = 0;
    get drawCalls() {
        return this._drawCalls;
    }

    readonly globalDescriptorSet: DescriptorSet;

    private _uniforms: Uniform[] = [];

    private _globalPipelineLayout: PipelineLayout;

    constructor(readonly stages: readonly Stage[], samples: SampleCountFlagBits = SampleCountFlagBits.SAMPLE_COUNT_1) {
        const uniforms: Set<new () => Uniform> = new Set;
        for (const stage of stages) {
            for (const uniform of stage.uniforms) {
                uniforms.add(uniform);
            }
        }

        const descriptorSetLayoutInfo = new DescriptorSetLayoutInfo;
        for (const uniform of uniforms) {
            const instance = new uniform;
            descriptorSetLayoutInfo.bindings.add(shaderLib.createDescriptorSetLayoutBinding(instance.definition))
            this._uniforms.push(instance);
        }

        const descriptorSetLayout = device.createDescriptorSetLayout();
        (descriptorSetLayout as any).name = "global descriptorSetLayout";
        descriptorSetLayout.initialize(descriptorSetLayoutInfo);

        const pipelineLayoutInfo = new PipelineLayoutInfo;
        pipelineLayoutInfo.layouts.add(descriptorSetLayout);
        const pipelineLayout = device.createPipelineLayout();
        pipelineLayout.initialize(pipelineLayoutInfo);
        this._globalPipelineLayout = pipelineLayout;

        const globalDescriptorSet = device.createDescriptorSet();
        globalDescriptorSet.initialize(descriptorSetLayout);
        this.globalDescriptorSet = globalDescriptorSet;

        const framebufferInfo = new FramebufferInfo;
        if (samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
            framebufferInfo.colorAttachments.add(device.swapchain.colorTexture);
        } else {
            const colorAttachmentInfo = new TextureInfo;
            colorAttachmentInfo.samples = samples;
            colorAttachmentInfo.usage = TextureUsageBits.COLOR_ATTACHMENT | TextureUsageBits.TRANSIENT_ATTACHMENT;
            colorAttachmentInfo.width = device.swapchain.width;
            colorAttachmentInfo.height = device.swapchain.height;
            const colorAttachment = device.createTexture();
            colorAttachment.initialize(colorAttachmentInfo);
            framebufferInfo.colorAttachments.add(colorAttachment);
            framebufferInfo.resolveAttachments.add(device.swapchain.colorTexture);
        }

        const depthStencilAttachmentInfo = new TextureInfo;
        depthStencilAttachmentInfo.samples = samples;
        depthStencilAttachmentInfo.usage = TextureUsageBits.DEPTH_STENCIL_ATTACHMENT | TextureUsageBits.SAMPLED;
        depthStencilAttachmentInfo.width = device.swapchain.width;
        depthStencilAttachmentInfo.height = device.swapchain.height;
        const depthStencilAttachment = device.createTexture();
        depthStencilAttachment.initialize(depthStencilAttachmentInfo);
        framebufferInfo.depthStencilAttachment = depthStencilAttachment;

        framebufferInfo.renderPass = getRenderPass(ClearFlagBits.COLOR, samples);
        framebufferInfo.width = device.swapchain.width;
        framebufferInfo.height = device.swapchain.height;

        const framebuffer = device.createFramebuffer();
        framebuffer.initialize(framebufferInfo);
        this.framebuffer = framebuffer;
    }

    start() {
        for (const uniform of this._uniforms) {
            uniform.initialize();
        }
    }

    update() {
        for (const uniform of this._uniforms) {
            uniform.update();
        }
    }

    record(commandBuffer: CommandBuffer, scene: Root) {
        this._drawCalls = 0;

        const renderScene = Zero.instance.scene;
        for (let cameraIndex = 0; cameraIndex < renderScene.cameras.length; cameraIndex++) {
            const camera = renderScene.cameras[cameraIndex];
            const dynamicOffsets = new Uint32Vector;
            dynamicOffsets.add(shaderLib.sets.global.uniforms.Camera.size * cameraIndex);
            commandBuffer.bindDescriptorSet(this._globalPipelineLayout, shaderLib.sets.global.index, this.globalDescriptorSet, dynamicOffsets);
            for (const stage of this.stages) {
                if ((camera.visibilityFlags & stage.visibility) == 0) {
                    continue;
                }
                stage.record(commandBuffer, scene, camera);
                this._drawCalls += stage.drawCalls;
            }
        }
    }
}