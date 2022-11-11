import { BufferUsageFlagBits } from "../../gfx/Buffer.js";
import CommandBuffer from "../../gfx/CommandBuffer.js";
import { Framebuffer } from "../../gfx/Framebuffer.js";
import { DescriptorSet } from "../../gfx/Pipeline.js";
import RenderPass, { ImageLayout, LOAD_OP } from "../../gfx/RenderPass.js";
import Texture, { TextureUsageBit } from "../../gfx/Texture.js";
import mat3 from "../../math/mat3.js";
import mat4 from "../../math/mat4.js";
import quat from "../../math/quat.js";
import vec3 from "../../math/vec3.js";
import shaders from "../../shaders.js";
import BufferView from "../BufferView.js";
import { PassPhase } from "../Pass.js";

const LightBlock = shaders.builtinUniformBlocks.shadowmap.blocks.Light;

const SHADOWMAP_WIDTH = 1024;
const SHADOWMAP_HEIGHT = 1024;

export default class ShadowmapPhase {
    private _renderPass: RenderPass;
    private _framebuffer: Framebuffer;
    private _descriptorSet: DescriptorSet;
    private _lightUbo: BufferView;

    private _depthStencilAttachment: Texture;
    get depthStencilAttachment(): Texture {
        return this._depthStencilAttachment;
    }

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

        // const renderPass = gfx.createRenderPass();
        // const colorAttachment: AttachmentDescription = {
        //     loadOp: LOAD_OP.CLEAR,
        //     initialLayout: ImageLayout.UNDEFINED,
        //     finalLayout: ImageLayout.PRESENT_SRC
        // };
        // renderPass.initialize({
        //     colorAttachments: [colorAttachment], depthStencilAttachment: {
        //         loadOp: LOAD_OP.CLEAR,
        //         initialLayout: ImageLayout.UNDEFINED,
        //         finalLayout: ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL
        //     }, hash: ""
        // });

        const depthStencilAttachment = gfx.createTexture();
        depthStencilAttachment.initialize({
            usage: TextureUsageBit.DEPTH_STENCIL_ATTACHMENT,
            width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT
        });
        const framebuffer = gfx.createFramebuffer();
        framebuffer.initialize({
            attachments: [depthStencilAttachment], renderPass: renderPass,
            width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT
        });
        this._framebuffer = framebuffer;
        this._renderPass = renderPass;
        this._depthStencilAttachment = depthStencilAttachment;
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
            const lightPos = directionalLight.node.position;
            const rotation = quat.fromMat3(quat.create(), mat3.fromViewUp(mat3.create(), vec3.normalize(vec3.create(), lightPos)));
            const model = mat4.fromRTS(mat4.create(), rotation, lightPos, vec3.create(1, 1, 1));
            this._lightUbo.set(mat4.invert(mat4.create(), model), LightBlock.uniforms.view.offset);
            const lightProjection = mat4.ortho(mat4.create(), -4, 4, -4, 4, 1, 10, gfx.capabilities.clipSpaceMinZ);
            this._lightUbo.set(lightProjection, LightBlock.uniforms.projection.offset);
            this._lightUbo.update();
        }
    }

    record(commandBuffer: CommandBuffer, cameraIndex: number) {
        const camera = zero.renderScene.cameras[cameraIndex];
        const models = zero.renderScene.models;
        commandBuffer.bindDescriptorSet(shaders.builtinShadowmapPipelineLayout, shaders.builtinUniformBlocks.shadowmap.set, this._descriptorSet);
        commandBuffer.beginRenderPass(this._renderPass, { x: 0, y: 0, width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT }, this._framebuffer);
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