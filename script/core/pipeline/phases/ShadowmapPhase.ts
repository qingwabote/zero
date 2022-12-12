import CommandBuffer from "../../gfx/CommandBuffer.js";
import { Framebuffer } from "../../gfx/Framebuffer.js";
import { SampleCountFlagBits } from "../../gfx/Pipeline.js";
import RenderPass, { ImageLayout, LOAD_OP, RenderPassInfo } from "../../gfx/RenderPass.js";
import { TextureUsageBit } from "../../gfx/Texture.js";
import PassPhase from "../../render/PassPhase.js";
import RenderCamera from "../../render/RenderCamera.js";
import VisibilityBit from "../../render/VisibilityBit.js";
import shaders from "../../shaders.js";
import PipelineUniform from "../PipelineUniform.js";
import RenderPhase from "../RenderPhase.js";
import ShadowMapUniform from "../uniforms/ShadowMapUniform.js";
import ShadowUniform from "../uniforms/ShadowUniform.js";

const SHADOWMAP_WIDTH = 1024;
const SHADOWMAP_HEIGHT = 1024;

export default class ShadowmapPhase extends RenderPhase {
    private _renderPass!: RenderPass;
    private _framebuffer!: Framebuffer;
    get framebuffer(): Framebuffer {
        return this._framebuffer;
    }

    constructor(visibility?: VisibilityBit) {
        super(visibility);
        const renderPass = gfx.createRenderPass();
        renderPass.initialize(new RenderPassInfo([], {
            loadOp: LOAD_OP.CLEAR,
            initialLayout: ImageLayout.UNDEFINED,
            finalLayout: ImageLayout.DEPTH_STENCIL_READ_ONLY_OPTIMAL
        }));

        const depthStencilAttachment = gfx.createTexture();
        depthStencilAttachment.initialize({
            samples: SampleCountFlagBits.SAMPLE_COUNT_1,
            usage: TextureUsageBit.DEPTH_STENCIL_ATTACHMENT | TextureUsageBit.SAMPLED,
            width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT
        });
        const framebuffer = gfx.createFramebuffer();
        framebuffer.initialize({
            colorAttachments: [],
            depthStencilAttachment,
            resolveAttachments: [],
            renderPass: renderPass,
            width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT
        });
        this._framebuffer = framebuffer;
        this._renderPass = renderPass;
    }

    getRequestedUniforms(): (new () => PipelineUniform)[] {
        // const global = shaders.sets.global;
        // return {
        //     Shadow: global.uniforms.Shadow,
        //     shadowMap: global.uniforms.shadowMap
        // };
        return [ShadowUniform, ShadowMapUniform];
    }

    record(commandBuffer: CommandBuffer, camera: RenderCamera) {
        if ((camera.visibilities & zero.renderScene.directionalLight.node.visibility) == 0) {
            return;
        }

        const models = zero.renderScene.models;
        commandBuffer.beginRenderPass(this._renderPass, this._framebuffer, { x: 0, y: 0, width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT });
        // commandBuffer.beginRenderPass(this._renderPass, camera.viewport);
        for (const model of models) {
            if ((camera.visibilities & model.node.visibility) == 0) {
                continue;
            }
            for (const subModel of model.subModels) {
                if (subModel.inputAssemblers.length == 0) {
                    continue;
                }
                for (let i = 0; i < subModel.passes.length; i++) {
                    const pass = subModel.passes[i];
                    if (pass.phase != PassPhase.SHADOWMAP) {
                        continue;
                    }
                    const inputAssembler = subModel.inputAssemblers[i];
                    commandBuffer.bindInputAssembler(inputAssembler);
                    const layout = zero.renderFlow.getPipelineLayout(pass.shader);
                    commandBuffer.bindDescriptorSet(layout, shaders.sets.local.set, model.descriptorSet);
                    const pipeline = zero.renderFlow.getPipeline(pass, inputAssembler.vertexInputState, this._renderPass, layout);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.draw();
                }
            }
        }
        commandBuffer.endRenderPass();
    }
}