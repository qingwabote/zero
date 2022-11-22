import CommandBuffer from "../../gfx/CommandBuffer.js";
import { Framebuffer } from "../../gfx/Framebuffer.js";
import { DescriptorSet } from "../../gfx/Pipeline.js";
import RenderPass, { ImageLayout, LOAD_OP } from "../../gfx/RenderPass.js";
import Texture, { TextureUsageBit } from "../../gfx/Texture.js";
import shaders from "../../shaders.js";
import RenderCamera from "../RenderCamera.js";
import RenderPhase, { PhaseBit } from "../RenderPhase.js";

const SHADOWMAP_WIDTH = 1024;
const SHADOWMAP_HEIGHT = 1024;

export default class ShadowmapPhase extends RenderPhase {
    private _renderPass: RenderPass;
    private _framebuffer: Framebuffer;

    private _depthStencilAttachment: Texture;
    get depthStencilAttachment(): Texture {
        return this._depthStencilAttachment;
    }

    constructor(globalDescriptorSet: DescriptorSet) {
        super(PhaseBit.SHADOWMAP);
        const renderPass = gfx.createRenderPass();
        renderPass.initialize({
            colorAttachments: [],
            depthStencilAttachment: {
                loadOp: LOAD_OP.CLEAR,
                initialLayout: ImageLayout.UNDEFINED,
                finalLayout: ImageLayout.DEPTH_STENCIL_READ_ONLY_OPTIMAL
            },
            hash: "shadowMapRenderPass"
        });

        const depthStencilAttachment = gfx.createTexture();
        depthStencilAttachment.initialize({
            usage: TextureUsageBit.DEPTH_STENCIL_ATTACHMENT | TextureUsageBit.SAMPLED,
            width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT
        });
        globalDescriptorSet.bindTexture(shaders.builtinUniforms.global.samplers.shadowMap.binding, depthStencilAttachment);
        const framebuffer = gfx.createFramebuffer();
        framebuffer.initialize({
            attachments: [depthStencilAttachment], renderPass: renderPass,
            width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT
        });
        this._framebuffer = framebuffer;
        this._renderPass = renderPass;
        this._depthStencilAttachment = depthStencilAttachment;
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
                    if (pass.phase != this._phase) {
                        continue;
                    }
                    const inputAssembler = subModel.inputAssemblers[i];
                    commandBuffer.bindInputAssembler(inputAssembler);
                    const layout = zero.renderScene.getPipelineLayout(pass.shader);
                    commandBuffer.bindDescriptorSet(layout, shaders.builtinUniforms.local.set, model.descriptorSet);
                    const pipeline = zero.renderScene.getPipeline(pass, inputAssembler.vertexInputState, this._renderPass, layout);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.draw();
                }
            }
        }
        commandBuffer.endRenderPass();
    }
}