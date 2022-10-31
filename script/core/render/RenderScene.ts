import CommandBuffer from "../gfx/CommandBuffer.js";
import Pipeline, { ClearFlagBit, DescriptorSet, PipelineInfo, PipelineLayout } from "../gfx/Pipeline.js";
import RenderPass, { AttachmentDescription, ImageLayout, LOAD_OP } from "../gfx/RenderPass.js";
import vec3 from "../math/vec3.js";
import shaders from "../shaders.js";
import Model from "./Model.js";
import RenderCamera from "./RenderCamera.js";
import RenderDirectionalLight from "./RenderDirectionalLight.js";
import { RenderNode } from "./RenderNode.js";
import ResizableBuffer from "./ResizableBuffer.js";

export default class RenderScene {
    private _globalUbo: ResizableBuffer;
    private _globalUboDirty: boolean = true;

    private _directionalLight!: RenderDirectionalLight;
    set directionalLight(value: RenderDirectionalLight) {
        this._directionalLight = value;
        this._globalUboDirty = true;
    }

    private _camerasUbo: ResizableBuffer;

    private _cameras: RenderCamera[] = [];
    get cameras(): RenderCamera[] {
        return this._cameras;
    }

    private _models: Model[] = [];
    get models(): Model[] {
        return this._models;
    }

    private _dirtyTransforms: Map<RenderNode, RenderNode> = new Map;
    get dirtyTransforms(): Map<RenderNode, RenderNode> {
        return this._dirtyTransforms;
    }

    private _globalDescriptorSet: DescriptorSet;

    private _clearFlag2renderPass: Record<number, RenderPass> = {};

    private _pipelineLayoutCache: Record<string, PipelineLayout> = {};
    private _pipelineCache: Record<string, Pipeline> = {};

    constructor() {
        const globalDescriptorSet = gfx.createDescriptorSet();
        globalDescriptorSet.initialize(shaders.builtinDescriptorSetLayouts.global);

        const GlobalBlock = shaders.builtinUniformBlocks.global.blocks.Global;
        const globalUbo = new ResizableBuffer(globalDescriptorSet, GlobalBlock.binding);
        globalUbo.reset(GlobalBlock.size);
        this._globalUbo = globalUbo;

        const CameraBlock = shaders.builtinUniformBlocks.global.blocks.Camera;
        this._camerasUbo = new ResizableBuffer(globalDescriptorSet, CameraBlock.binding, CameraBlock.size);

        this._globalDescriptorSet = globalDescriptorSet;
    }

    update(dt: number) {
        if (this._globalUboDirty || this._dirtyTransforms.has(this._directionalLight.node)) {
            const litDir = vec3.create(0, 0, 0);
            this._directionalLight.node.updateTransform();
            vec3.transformMat4(litDir, vec3.zero, this._directionalLight.node.matrix);
            vec3.normalize(litDir, litDir);

            this._globalUbo.set(litDir, 0);
            this._globalUbo.update();
            this._globalUboDirty = false;
        }

        const CameraBlock = shaders.builtinUniformBlocks.global.blocks.Camera;
        const camerasUboSize = CameraBlock.size * this._cameras.length;
        this._camerasUbo.resize(camerasUboSize);

        let camerasDataOffset = 0;
        let camerasDataDirty = false;
        for (let i = 0; i < this._cameras.length; i++) {
            const camera = this._cameras[i];
            if (camera.update()) {
                this._camerasUbo.set(camera.matView, camerasDataOffset + CameraBlock.uniforms.matView.offset);
                this._camerasUbo.set(camera.matProj, camerasDataOffset + CameraBlock.uniforms.matProj.offset);
                this._camerasUbo.set(camera.position, camerasDataOffset + CameraBlock.uniforms.cameraPos.offset);
                camerasDataDirty = true;
            }
            camerasDataOffset += CameraBlock.size / Float32Array.BYTES_PER_ELEMENT;
        }

        if (camerasDataDirty) {
            this._camerasUbo.update();
        }

        for (let i = 0; i < this._models.length; i++) {
            this._models[i].update()
        }

        this._dirtyTransforms.clear();
    }

    record(commandBuffer: CommandBuffer) {
        commandBuffer.begin();

        const cameras = this._cameras;
        for (let cameraIndex = 0; cameraIndex < cameras.length; cameraIndex++) {
            const camera = cameras[cameraIndex];
            let renderPass = this._clearFlag2renderPass[camera.clearFlags];
            if (!renderPass) {
                renderPass = gfx.createRenderPass();
                const colorAttachment: AttachmentDescription = {
                    loadOp: camera.clearFlags & ClearFlagBit.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                    initialLayout: camera.clearFlags & ClearFlagBit.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC,
                    finalLayout: ImageLayout.PRESENT_SRC
                };
                const depthStencilAttachment: AttachmentDescription = {
                    loadOp: camera.clearFlags & ClearFlagBit.DEPTH ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                    initialLayout: camera.clearFlags & ClearFlagBit.DEPTH ? ImageLayout.UNDEFINED : ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
                    finalLayout: ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL
                };
                renderPass.initialize({ colorAttachments: [colorAttachment], depthStencilAttachment, hash: camera.clearFlags.toString() });
                this._clearFlag2renderPass[camera.clearFlags] = renderPass;
            }
            commandBuffer.beginRenderPass(renderPass, camera.viewport);

            for (const model of this._models) {
                if ((camera.visibilities & model.node.visibility) == 0) {
                    continue;
                }
                for (const subModel of model.subModels) {
                    if (!subModel.inputAssembler) {
                        continue;
                    }
                    commandBuffer.bindInputAssembler(subModel.inputAssembler);
                    for (const pass of subModel.passes) {
                        const shader = pass.shader;

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

                        const pipelineInfo: PipelineInfo = {
                            shader,
                            vertexInputState: subModel.inputAssembler.vertexInputState,
                            layout,
                            renderPass
                        }
                        const pipelineHash = pipelineInfo.shader.info.hash + pipelineInfo.vertexInputState.hash + renderPass.info.hash;
                        let pipeline = this._pipelineCache[pipelineHash];
                        if (!pipeline) {
                            pipeline = gfx.createPipeline();
                            pipeline.initialize(pipelineInfo);
                            this._pipelineCache[pipelineHash] = pipeline;
                        }

                        commandBuffer.bindPipeline(pipeline);
                        commandBuffer.bindDescriptorSet(layout, shaders.builtinUniformBlocks.global.set, this._globalDescriptorSet,
                            [cameraIndex * shaders.builtinUniformBlocks.global.blocks.Camera.size]);
                        commandBuffer.bindDescriptorSet(layout, shaders.builtinUniformBlocks.local.set, model.descriptorSet);
                        commandBuffer.bindDescriptorSet(layout, shaders.builtinUniformBlocks.material.set, pass.descriptorSet);

                        commandBuffer.draw();
                    }
                }
            }

            commandBuffer.endRenderPass()
        }

        commandBuffer.end();
    }
}