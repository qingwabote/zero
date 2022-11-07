import { BufferUsageFlagBits } from "../../gfx/Buffer.js";
import CommandBuffer from "../../gfx/CommandBuffer.js";
import { Framebuffer } from "../../gfx/Framebuffer.js";
import { DescriptorSet } from "../../gfx/Pipeline.js";
import RenderPass, { ImageLayout, LOAD_OP } from "../../gfx/RenderPass.js";
import { TextureUsageBit } from "../../gfx/Texture.js";
import mat4 from "../../math/mat4.js";
import shaders from "../../shaders.js";
import BufferView from "../BufferView.js";
import { PassPhase } from "../Pass.js";

const LightBlock = shaders.builtinUniformBlocks.shadowmap.blocks.Light;

export default class ShadowmapPhase {
    private _renderPass: RenderPass;
    private _framebuffer: Framebuffer;
    private _descriptorSet: DescriptorSet;
    private _lightUbo: BufferView;

    constructor() {
        const renderPass = gfx.createRenderPass();
        renderPass.initialize({
            colorAttachments: [],
            depthStencilAttachment: {
                loadOp: LOAD_OP.CLEAR,
                initialLayout: ImageLayout.UNDEFINED,
                finalLayout: ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL
            },
            hash: "shadowMapRenderPass"
        });
        const depthStencilAttachment = gfx.createTexture();
        depthStencilAttachment.initialize({
            usage: TextureUsageBit.DEPTH_STENCIL_ATTACHMENT,
            width: zero.window.width, height: zero.window.height
        });
        const framebuffer = gfx.createFramebuffer();
        framebuffer.initialize({
            attachments: [depthStencilAttachment], renderPass: renderPass,
            width: zero.window.width, height: zero.window.height
        });
        this._framebuffer = framebuffer;
        this._renderPass = renderPass;
        const lightUbo = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, LightBlock.size);
        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(shaders.builtinDescriptorSetLayouts.shadowmap);
        descriptorSet.bindBuffer(LightBlock.binding, lightUbo.buffer);
        this._descriptorSet = descriptorSet;
        this._lightUbo = lightUbo;
    }

    update() {
        const renderScene = zero.renderScene;
        const dirtyObjects = renderScene.dirtyObjects;
        const directionalLight = renderScene.directionalLight;
        if (dirtyObjects.has(directionalLight) || dirtyObjects.has(directionalLight.node)) {
            directionalLight.node.updateTransform();

            const lightView = mat4.invert(mat4.create(), directionalLight.node.matrix);
            this._lightUbo.set(lightView, LightBlock.uniforms.view.offset);
            const lightProjection = mat4.ortho(mat4.create(), -4, 4, -4, 4, 1, 2000, gfx.capabilities.clipSpaceMinZ);
            this._lightUbo.set(lightProjection, LightBlock.uniforms.projection.offset);
        }
    }

    record(commandBuffer: CommandBuffer, cameraIndex: number) {
        const camera = zero.renderScene.cameras[cameraIndex];
        const models = zero.renderScene.models;
        commandBuffer.bindDescriptorSet(shaders.builtinShadowmapPipelineLayout, shaders.builtinUniformBlocks.shadowmap.set, this._descriptorSet);
        commandBuffer.beginRenderPass(this._renderPass, camera.viewport, this._framebuffer);
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
                    commandBuffer.bindDescriptorSet(shaders.builtinShadowmapPipelineLayout, shaders.builtinUniformBlocks.local.set, model.descriptorSet);
                    const pipeline = zero.renderScene.getPipeline(pass.shader, inputAssembler.vertexInputState, this._renderPass, shaders.builtinShadowmapPipelineLayout);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.draw();
                }
            }
        }
        commandBuffer.endRenderPass();
    }
}