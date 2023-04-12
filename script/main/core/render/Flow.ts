import CommandBuffer from "../gfx/CommandBuffer.js";
import DescriptorSet from "../gfx/DescriptorSet.js";
import { DescriptorSetLayoutBinding } from "../gfx/DescriptorSetLayout.js";
import { Framebuffer } from "../gfx/Framebuffer.js";
import { ClearFlagBits, PipelineLayout, SampleCountFlagBits } from "../gfx/Pipeline.js";
import RenderPass, { AttachmentDescription, ImageLayout, LOAD_OP, RenderPassInfo } from "../gfx/RenderPass.js";
import Texture, { TextureUsageBits } from "../gfx/Texture.js";
import ShaderLib from "../ShaderLib.js";
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

        const descriptorSetLayoutBindings: DescriptorSetLayoutBinding[] = [];
        for (const uniform of uniforms) {
            const instance = new uniform;
            descriptorSetLayoutBindings.push(ShaderLib.createDescriptorSetLayoutBinding(instance.definition))
            this._uniforms.push(instance);
        }

        const descriptorSetLayout = gfx.createDescriptorSetLayout();
        descriptorSetLayout.initialize(descriptorSetLayoutBindings);

        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(descriptorSetLayout);

        const pipelineLayout = gfx.createPipelineLayout();
        pipelineLayout.initialize([descriptorSetLayout]);
        this._globalPipelineLayout = pipelineLayout;

        this.globalDescriptorSet = descriptorSet;

        const colorAttachments: Texture[] = [];
        const resolveAttachments: Texture[] = [];
        if (samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
            colorAttachments.push(gfx.swapchain.colorTexture);
        } else {
            const colorAttachment = gfx.createTexture();
            colorAttachment.initialize({
                samples,
                usage: TextureUsageBits.COLOR_ATTACHMENT | TextureUsageBits.TRANSIENT_ATTACHMENT,
                width: zero.window.width, height: zero.window.height
            })
            colorAttachments.push(colorAttachment);
            resolveAttachments.push(gfx.swapchain.colorTexture);
        }

        const depthStencilAttachment = gfx.createTexture();
        depthStencilAttachment.initialize({
            samples,
            usage: TextureUsageBits.DEPTH_STENCIL_ATTACHMENT | TextureUsageBits.SAMPLED,
            width: zero.window.width, height: zero.window.height
        });
        const framebuffer = gfx.createFramebuffer();
        framebuffer.initialize({
            colorAttachments,
            depthStencilAttachment,
            resolveAttachments,
            renderPass: this.getRenderPass(ClearFlagBits.COLOR, samples),
            width: zero.window.width, height: zero.window.height
        });
        this.framebuffer = framebuffer;
    }

    initialize() {
        for (const uniform of this._uniforms) {
            uniform.initialize();
        }
    }

    update() {
        for (const model of zero.scene.models) {
            model.update();
        }

        for (const uniform of this._uniforms) {
            uniform.update();
        }
    }

    record(commandBuffer: CommandBuffer) {
        this._drawCalls = 0;

        const renderScene = zero.scene;
        for (let cameraIndex = 0; cameraIndex < renderScene.cameras.length; cameraIndex++) {
            const camera = renderScene.cameras[cameraIndex];
            commandBuffer.bindDescriptorSet(this._globalPipelineLayout, ShaderLib.sets.global.index, this.globalDescriptorSet,
                [ShaderLib.sets.global.uniforms.Camera.size * cameraIndex]);
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
            const colorAttachments: AttachmentDescription[] = [];
            const resolveAttachments: AttachmentDescription[] = [];
            if (samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
                colorAttachments.push({
                    loadOp: clearFlags & ClearFlagBits.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                    initialLayout: clearFlags & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC,
                    finalLayout: ImageLayout.PRESENT_SRC
                })
            } else {
                colorAttachments.push({
                    loadOp: clearFlags & ClearFlagBits.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                    initialLayout: clearFlags & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
                    finalLayout: ImageLayout.COLOR_ATTACHMENT_OPTIMAL
                });
                resolveAttachments.push({
                    loadOp: clearFlags & ClearFlagBits.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                    initialLayout: clearFlags & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC,
                    finalLayout: ImageLayout.PRESENT_SRC
                })
            }

            const depthStencilAttachment: AttachmentDescription = {
                loadOp: clearFlags & ClearFlagBits.DEPTH ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                initialLayout: clearFlags & ClearFlagBits.DEPTH ? ImageLayout.UNDEFINED : ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
                finalLayout: ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL
            };
            renderPass = gfx.createRenderPass();
            renderPass.initialize(new RenderPassInfo(colorAttachments, depthStencilAttachment, resolveAttachments, samples));
            this._clearFlag2renderPass[hash] = renderPass;
        }
        return renderPass;
    }
}