import { device } from "boot";
import { ClearFlagBits, CommandBuffer, DescriptorSet, DescriptorSetLayoutInfo, Framebuffer, FramebufferInfo, PipelineLayout, PipelineLayoutInfo, SampleCountFlagBits, TextureInfo, TextureUsageBits, Uint32Vector } from "gfx";
import { Zero } from "../../Zero.js";
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

        const descriptorSetLayout = device.createDescriptorSetLayout(descriptorSetLayoutInfo);
        (descriptorSetLayout as any).name = "global descriptorSetLayout";

        const pipelineLayoutInfo = new PipelineLayoutInfo;
        pipelineLayoutInfo.layouts.add(descriptorSetLayout);
        this._globalPipelineLayout = device.createPipelineLayout(pipelineLayoutInfo);

        this.globalDescriptorSet = device.createDescriptorSet(descriptorSetLayout);

        const framebufferInfo = new FramebufferInfo;
        if (samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
            framebufferInfo.colorAttachments.add(device.swapchain.colorTexture);
        } else {
            const colorAttachmentInfo = new TextureInfo;
            colorAttachmentInfo.samples = samples;
            colorAttachmentInfo.usage = TextureUsageBits.COLOR_ATTACHMENT | TextureUsageBits.TRANSIENT_ATTACHMENT;
            colorAttachmentInfo.width = device.swapchain.width;
            colorAttachmentInfo.height = device.swapchain.height;
            framebufferInfo.colorAttachments.add(device.createTexture(colorAttachmentInfo));
            framebufferInfo.resolveAttachments.add(device.swapchain.colorTexture);
        }

        const depthStencilAttachmentInfo = new TextureInfo;
        depthStencilAttachmentInfo.samples = samples;
        depthStencilAttachmentInfo.usage = TextureUsageBits.DEPTH_STENCIL_ATTACHMENT | TextureUsageBits.SAMPLED;
        depthStencilAttachmentInfo.width = device.swapchain.width;
        depthStencilAttachmentInfo.height = device.swapchain.height;
        framebufferInfo.depthStencilAttachment = device.createTexture(depthStencilAttachmentInfo);

        framebufferInfo.renderPass = getRenderPass(ClearFlagBits.COLOR, samples);
        framebufferInfo.width = device.swapchain.width;
        framebufferInfo.height = device.swapchain.height;

        this.framebuffer = device.createFramebuffer(framebufferInfo);
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