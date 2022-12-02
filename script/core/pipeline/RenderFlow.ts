import CommandBuffer from "../gfx/CommandBuffer.js";
import { Framebuffer } from "../gfx/Framebuffer.js";
import Pipeline, { ClearFlagBit, DescriptorSet, DescriptorSetLayout, PipelineLayout, SampleCountFlagBits, VertexInputState } from "../gfx/Pipeline.js";
import RenderPass, { AttachmentDescription, ImageLayout, LOAD_OP, RenderPassInfo } from "../gfx/RenderPass.js";
import Shader from "../gfx/Shader.js";
import Texture, { TextureUsageBit } from "../gfx/Texture.js";
import Pass from "../render/Pass.js";
import shaders from "../shaders.js";
import PipelineUniform from "./PipelineUniform.js";
import RenderPhase from "./RenderPhase.js";
import CameraUniform from "./uniforms/CameraUniform.js";
import LightUniform from "./uniforms/LightUniform.js";
import ShadowUniform from "./uniforms/ShadowUniform.js";

const global_uniforms = shaders.sets.global.uniforms;

export default class RenderFlow {
    private _framebuffer: Framebuffer;
    get framebuffer(): Framebuffer {
        return this._framebuffer;
    }

    private _renderPhases: RenderPhase[];

    private _globalDescriptorSetLayout: DescriptorSetLayout;

    readonly globalDescriptorSet: DescriptorSet;

    private _uniforms: PipelineUniform[] = [];

    private _globalPipelineLayout: PipelineLayout;

    private _clearFlag2renderPass: Record<string, RenderPass> = {};

    private _pipelineLayoutCache: Record<string, PipelineLayout> = {};

    private _pipelineCache: Record<string, Pipeline> = {};

    constructor(renderPhases: RenderPhase[], samples: SampleCountFlagBits = SampleCountFlagBits.SAMPLE_COUNT_1) {
        const uniforms: Record<string, any> = {};
        for (const renderPhase of renderPhases) {
            Object.assign(uniforms, renderPhase.getRequestedUniforms());
        }

        const globalDescriptorSetLayout = shaders.buildDescriptorSetLayout(uniforms);

        const globalDescriptorSet = gfx.createDescriptorSet();
        globalDescriptorSet.initialize(globalDescriptorSetLayout);

        for (const key in uniforms) {
            switch (uniforms[key]) {
                case global_uniforms.Light:
                    this._uniforms.push(new LightUniform(globalDescriptorSet));
                    break;
                case global_uniforms.Camera:
                    this._uniforms.push(new CameraUniform(globalDescriptorSet));
                    break;
                case global_uniforms.Shadow:
                    this._uniforms.push(new ShadowUniform(globalDescriptorSet));
                    break;
            }
        }

        for (const renderPhase of renderPhases) {
            renderPhase.initialize(globalDescriptorSet);
        }

        const globalPipelineLayout = gfx.createPipelineLayout();
        globalPipelineLayout.initialize([globalDescriptorSetLayout]);
        this._globalPipelineLayout = globalPipelineLayout;

        this._globalDescriptorSetLayout = globalDescriptorSetLayout;

        this.globalDescriptorSet = globalDescriptorSet;
        this._renderPhases = renderPhases;

        const colorAttachments: Texture[] = [];
        const resolveAttachments: Texture[] = [];
        if (samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
            colorAttachments.push(gfx.swapchain.colorTexture);
        } else {
            const colorAttachment = gfx.createTexture();
            colorAttachment.initialize({
                samples,
                usage: TextureUsageBit.COLOR_ATTACHMENT,
                width: zero.window.width, height: zero.window.height
            })
            colorAttachments.push(colorAttachment);
            resolveAttachments.push(gfx.swapchain.colorTexture);
        }

        const depthStencilAttachment = gfx.createTexture();
        depthStencilAttachment.initialize({
            samples,
            usage: TextureUsageBit.DEPTH_STENCIL_ATTACHMENT | TextureUsageBit.SAMPLED,
            width: zero.window.width, height: zero.window.height
        });
        const framebuffer = gfx.createFramebuffer();
        framebuffer.initialize({
            colorAttachments,
            depthStencilAttachment,
            resolveAttachments,
            renderPass: this.getRenderPass(ClearFlagBit.COLOR, samples),
            width: zero.window.width, height: zero.window.height
        });
        this._framebuffer = framebuffer;
    }

    update() {
        for (const uniform of this._uniforms) {
            uniform.update();
        }
    }

    record(commandBuffer: CommandBuffer) {
        const renderScene = zero.renderScene;
        for (let cameraIndex = 0; cameraIndex < renderScene.cameras.length; cameraIndex++) {
            const camera = renderScene.cameras[cameraIndex];
            commandBuffer.bindDescriptorSet(this._globalPipelineLayout, shaders.sets.global.set, this.globalDescriptorSet,
                [cameraIndex * shaders.sets.global.uniforms.Camera.size]);
            for (const renderPhase of this._renderPhases) {
                if ((camera.visibilities & renderPhase.visibility) == 0) {
                    continue;
                }
                renderPhase.record(commandBuffer, camera);
            }
        }
    }

    getRenderPass(clearFlags: ClearFlagBit, samples = SampleCountFlagBits.SAMPLE_COUNT_1): RenderPass {
        const hash = `${clearFlags}${samples}`;
        let renderPass = this._clearFlag2renderPass[hash];
        if (!renderPass) {
            const colorAttachments: AttachmentDescription[] = [];
            const resolveAttachments: AttachmentDescription[] = [];
            if (samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
                colorAttachments.push({
                    loadOp: clearFlags & ClearFlagBit.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                    initialLayout: clearFlags & ClearFlagBit.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC,
                    finalLayout: ImageLayout.PRESENT_SRC
                })
            } else {
                colorAttachments.push({
                    loadOp: clearFlags & ClearFlagBit.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                    initialLayout: clearFlags & ClearFlagBit.COLOR ? ImageLayout.UNDEFINED : ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
                    finalLayout: ImageLayout.COLOR_ATTACHMENT_OPTIMAL
                });
                resolveAttachments.push({
                    loadOp: clearFlags & ClearFlagBit.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                    initialLayout: clearFlags & ClearFlagBit.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC,
                    finalLayout: ImageLayout.PRESENT_SRC
                })
            }

            const depthStencilAttachment: AttachmentDescription = {
                loadOp: clearFlags & ClearFlagBit.DEPTH ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                initialLayout: clearFlags & ClearFlagBit.DEPTH ? ImageLayout.UNDEFINED : ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
                finalLayout: ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL
            };
            renderPass = gfx.createRenderPass();
            renderPass.initialize(new RenderPassInfo(colorAttachments, depthStencilAttachment, resolveAttachments, samples));
            this._clearFlag2renderPass[hash] = renderPass;
        }
        return renderPass;
    }

    getPipelineLayout(shader: Shader): PipelineLayout {
        let layout = this._pipelineLayoutCache[shader.info.hash];
        if (!layout) {
            layout = gfx.createPipelineLayout();
            layout.initialize([
                this._globalDescriptorSetLayout,
                shaders.builtinDescriptorSetLayouts.local,
                shaders.getDescriptorSetLayout(shader)
            ])
            this._pipelineLayoutCache[shader.info.hash] = layout;
        }
        return layout;
    }

    getPipeline(pass: Pass, vertexInputState: VertexInputState, compatibleRenderPass: RenderPass, layout: PipelineLayout): Pipeline {
        // https://registry.khronos.org/vulkan/specs/1.3-extensions/html/vkspec.html#renderpass-compatibility
        const compatibleRenderPassHash = `${compatibleRenderPass.info.colorAttachments.length}1${compatibleRenderPass.info.resolveAttachments.length}${compatibleRenderPass.info.samples}`

        const pipelineHash = pass.hash + vertexInputState.hash + compatibleRenderPassHash;

        let pipeline = this._pipelineCache[pipelineHash];
        if (!pipeline) {
            pipeline = gfx.createPipeline();
            pipeline.initialize({ shader: pass.shader, vertexInputState, renderPass: compatibleRenderPass, layout, rasterizationState: pass.rasterizationState });
            this._pipelineCache[pipelineHash] = pipeline;
        }
        return pipeline;
    }
}