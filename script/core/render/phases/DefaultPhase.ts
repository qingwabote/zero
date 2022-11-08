import { BufferUsageFlagBits } from "../../gfx/Buffer.js";
import CommandBuffer from "../../gfx/CommandBuffer.js";
import { ClearFlagBit, DescriptorSet, PipelineLayout } from "../../gfx/Pipeline.js";
import RenderPass, { AttachmentDescription, ImageLayout, LOAD_OP } from "../../gfx/RenderPass.js";
import Shader from "../../gfx/Shader.js";
import mat4 from "../../math/mat4.js";
import vec3 from "../../math/vec3.js";
import shaders from "../../shaders.js";
import BufferViewResizable from "../BufferViewResizable.js";
import { PassPhase } from "../Pass.js";

const GlobalBlock = shaders.builtinUniformBlocks.global.blocks.Global;
const CameraBlock = shaders.builtinUniformBlocks.global.blocks.Camera;

export default class DefaultPhase {
    private _clearFlag2renderPass: Record<number, RenderPass> = {};
    private _pipelineLayoutCache: Record<string, PipelineLayout> = {};

    private _globalDescriptorSet: DescriptorSet;
    private _globalUbo: BufferViewResizable;
    private _camerasUbo: BufferViewResizable;

    constructor() {
        const globalDescriptorSet = gfx.createDescriptorSet();
        globalDescriptorSet.initialize(shaders.builtinDescriptorSetLayouts.global);
        const globalUbo = new BufferViewResizable("Float32", BufferUsageFlagBits.UNIFORM, buffer => { globalDescriptorSet.bindBuffer(GlobalBlock.binding, buffer); });
        globalUbo.reset(GlobalBlock.size);
        this._globalUbo = globalUbo;
        this._globalDescriptorSet = globalDescriptorSet;

        this._camerasUbo = new BufferViewResizable("Float32", BufferUsageFlagBits.UNIFORM, buffer => { globalDescriptorSet.bindBuffer(CameraBlock.binding, buffer, CameraBlock.size); });
    }

    update() {
        const renderScene = zero.renderScene;
        const dirtyObjects = renderScene.dirtyObjects;
        const directionalLight = renderScene.directionalLight;
        if (dirtyObjects.has(directionalLight) || dirtyObjects.has(directionalLight.node)) {
            directionalLight.node.updateTransform();
            const litDir = vec3.transformMat4(vec3.create(), vec3.zero, directionalLight.node.matrix);
            vec3.normalize(litDir, litDir);
            this._globalUbo.set(litDir, 0);
            this._globalUbo.update();
        }

        const cameras = zero.renderScene.cameras;
        const camerasUboSize = CameraBlock.size * cameras.length;
        this._camerasUbo.resize(camerasUboSize);
        let camerasDataOffset = 0;
        let camerasDataDirty = false;
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (dirtyObjects.has(camera) || dirtyObjects.has(camera.node)) {
                camera.node.updateTransform();

                const view = mat4.invert(mat4.create(), camera.node.matrix)
                this._camerasUbo.set(view, camerasDataOffset + CameraBlock.uniforms.view.offset);

                const projection = mat4.create();
                const aspect = camera.viewport.width / camera.viewport.height;
                if (camera.orthoHeight != -1) {
                    const x = camera.orthoHeight * aspect;
                    const y = camera.orthoHeight;
                    mat4.ortho(projection, -x, x, -y, y, 1, 2000, gfx.capabilities.clipSpaceMinZ);
                } else if (camera.fov != -1) {
                    mat4.perspective(projection, Math.PI / 180 * camera.fov, aspect, 1, 1000);
                }
                this._camerasUbo.set(projection, camerasDataOffset + CameraBlock.uniforms.projection.offset);

                const position = vec3.transformMat4(vec3.create(), vec3.zero, camera.node.matrix);
                this._camerasUbo.set(position, camerasDataOffset + CameraBlock.uniforms.position.offset);

                camerasDataDirty = true;
            }
            camerasDataOffset += CameraBlock.size / Float32Array.BYTES_PER_ELEMENT;
        }
        if (camerasDataDirty) {
            this._camerasUbo.update();
        }
    }

    record(commandBuffer: CommandBuffer, cameraIndex: number) {
        const camera = zero.renderScene.cameras[cameraIndex];
        const models = zero.renderScene.models;
        commandBuffer.bindDescriptorSet(shaders.builtinGlobalPipelineLayout, shaders.builtinUniformBlocks.global.set, this._globalDescriptorSet,
            [cameraIndex * shaders.builtinUniformBlocks.global.blocks.Camera.size]);
        const renderPass = this.getRenderPass(camera.clearFlags);
        commandBuffer.beginRenderPass(renderPass, camera.viewport);
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
                    if (pass.phase != PassPhase.DEFAULT) {
                        continue;
                    }
                    const inputAssembler = subModel.inputAssemblers[i];
                    commandBuffer.bindInputAssembler(inputAssembler);
                    const layout = this.getPipelineLayout(pass.shader);
                    commandBuffer.bindDescriptorSet(layout, shaders.builtinUniformBlocks.local.set, model.descriptorSet);
                    commandBuffer.bindDescriptorSet(layout, shaders.builtinUniformBlocks.material.set, pass.descriptorSet);
                    const pipeline = zero.renderScene.getPipeline(pass.shader, inputAssembler.vertexInputState, renderPass, layout);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.draw();
                }
            }
        }
        commandBuffer.endRenderPass()
    }

    private getRenderPass(clearFlags: ClearFlagBit): RenderPass {
        let renderPass = this._clearFlag2renderPass[clearFlags];
        if (!renderPass) {
            renderPass = gfx.createRenderPass();
            const colorAttachment: AttachmentDescription = {
                loadOp: clearFlags & ClearFlagBit.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                initialLayout: clearFlags & ClearFlagBit.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC,
                finalLayout: ImageLayout.PRESENT_SRC
            };
            const depthStencilAttachment: AttachmentDescription = {
                loadOp: clearFlags & ClearFlagBit.DEPTH ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                initialLayout: clearFlags & ClearFlagBit.DEPTH ? ImageLayout.UNDEFINED : ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
                finalLayout: ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL
            };
            renderPass.initialize({ colorAttachments: [colorAttachment], depthStencilAttachment, hash: clearFlags.toString() });
            this._clearFlag2renderPass[clearFlags] = renderPass;
        }
        return renderPass;
    }

    private getPipelineLayout(shader: Shader): PipelineLayout {
        let layout = this._pipelineLayoutCache[shader.info.hash];
        if (!layout) {
            layout = gfx.createPipelineLayout();
            layout.initialize([
                shaders.builtinDescriptorSetLayouts.global,
                shaders.builtinDescriptorSetLayouts.local,
                shader.info.meta.descriptorSetLayout
            ])
            this._pipelineLayoutCache[shader.info.hash] = layout;
        }
        return layout;
    }
}