import { CommandBuffer, FormatInfos, InputAssembler, PassState, Pipeline, PipelineLayout, RenderPass, VertexInputRate, impl } from "gfx-main";
import { VisibilityFlagBits } from "../../VisibilityFlagBits.js";
import { Zero } from "../../core/Zero.js";
import { device } from "../../core/impl.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Camera } from "../../core/render/scene/Camera.js";
import { Model } from "../../core/render/scene/Model.js";
import { Pass } from "../../core/render/scene/Pass.js";
import { Root } from "../../core/render/scene/Root.js";
import { shaderLib } from "../../core/shaderLib.js";
import { hashLib } from "./internal/hashLib.js";

const modelPipelineLayoutCache: Map<typeof Model, PipelineLayout> = new Map;
const pipelineLayoutCache: Record<number, PipelineLayout> = {};
const pipelineCache: Record<number, Pipeline> = {};

export class ModelPhase extends Phase {
    constructor(private _passType = 'default', visibility: VisibilityFlagBits = VisibilityFlagBits.ALL) {
        super(visibility);
    }

    record(commandBuffer: CommandBuffer, scene: Root, camera: Camera, renderPass: RenderPass): void {
        this._drawCalls = 0;
        for (const model of scene.models) {
            if ((camera.visibilityFlags & model.visibilityFlag) == 0) {
                continue;
            }
            commandBuffer.bindDescriptorSet(this.getModelPipelineLayout(model), shaderLib.sets.local.index, model.descriptorSet);
            for (const subModel of model.subModels) {
                const drawInfo = subModel.drawInfo;
                if (!drawInfo.indexOrVertexCount) {
                    continue;
                }
                const inputAssembler = subModel.inputAssembler;
                for (let i = 0; i < subModel.passes.length; i++) {
                    const pass = subModel.passes[i];
                    if (pass.type != this._passType) {
                        continue;
                    }
                    commandBuffer.bindInputAssembler(inputAssembler);
                    const layout = this.getPipelineLayout(model, pass);
                    if (pass.descriptorSet) {
                        commandBuffer.bindDescriptorSet(layout, shaderLib.sets.material.index, pass.descriptorSet);
                    }
                    const pipeline = this.getPipeline(pass.state, inputAssembler, renderPass, layout);
                    commandBuffer.bindPipeline(pipeline);
                    if (inputAssembler.info.indexInput) {
                        commandBuffer.drawIndexed(drawInfo.indexOrVertexCount, drawInfo.firstIndexOrVertex || 0);
                    } else {
                        commandBuffer.draw(drawInfo.indexOrVertexCount);
                    }
                    this._drawCalls++;
                }
            }
        }
    }

    private getModelPipelineLayout(model: Model): PipelineLayout {
        const ModelType = model.constructor as typeof Model;
        let pipelineLayout = modelPipelineLayoutCache.get(ModelType);
        if (!pipelineLayout) {
            const info = new impl.PipelineLayoutInfo;
            info.layouts.add(Zero.instance.flow.globalDescriptorSet.layout);
            info.layouts.add(ModelType.descriptorSetLayout);
            pipelineLayout = device.createPipelineLayout();
            pipelineLayout.initialize(info);
            modelPipelineLayoutCache.set(ModelType, pipelineLayout);
        }
        return pipelineLayout;
    }

    private getPipelineLayout(model: Model, pass: Pass): PipelineLayout {
        const shader = pass.state.shader;
        const shader_hash = hashLib.shader(shader);
        let pipelineLayout = pipelineLayoutCache[shader_hash];
        if (!pipelineLayout) {
            const info = new impl.PipelineLayoutInfo;
            info.layouts.add(Zero.instance.flow.globalDescriptorSet.layout);
            info.layouts.add(model.descriptorSet.layout);
            if (pass.descriptorSet) {
                info.layouts.add(pass.descriptorSet.layout);
            }
            pipelineLayout = device.createPipelineLayout();
            pipelineLayout.initialize(info)
            pipelineLayoutCache[shader_hash] = pipelineLayout;
        }
        return pipelineLayout;
    }

    /**
     * @param renderPass a compatible renderPass
     */
    private getPipeline(pass: PassState, inputAssembler: InputAssembler, renderPass: RenderPass, layout: PipelineLayout): Pipeline {
        const inputAssemblerInfo = inputAssembler.info;
        const pipelineHash = hashLib.passState(pass) ^ hashLib.inputAssembler(inputAssemblerInfo) ^ hashLib.renderPass(renderPass.info);
        let pipeline = pipelineCache[pipelineHash];
        if (!pipeline) {
            const vertexInputState = new impl.VertexInputState;
            const vertexAttributes = inputAssemblerInfo.vertexAttributes;
            const vertexAttributesSize = vertexAttributes.size();
            const vertexBuffers = inputAssemblerInfo.vertexInput.buffers;
            const vertexBuffersSize = vertexBuffers.size();
            for (let binding = 0; binding < vertexBuffersSize; binding++) {
                const buffer = vertexBuffers.get(binding);
                let stride = buffer.info.stride;
                if (!stride) {
                    let count = 0;
                    for (let i = 0; i < vertexAttributesSize; i++) {
                        const attribute = vertexAttributes.get(i);
                        if (attribute.buffer == binding) {
                            count += FormatInfos[attribute.format].bytes;
                        }
                    }
                    stride = count;
                }
                const description = new impl.VertexInputBindingDescription;
                description.binding = binding;
                description.stride = stride;
                description.inputRate = VertexInputRate.VERTEX;
                vertexInputState.bindings.add(description);
            }
            for (let i = 0; i < vertexAttributesSize; i++) {
                const attribute = vertexAttributes.get(i);
                const definition = shaderLib.getMeta(pass.shader).attributes[attribute.name];
                if (!definition) {
                    continue;
                }

                const description = new impl.VertexInputAttributeDescription;
                description.location = definition.location;
                // attribute.format in buffer can be different from definition.format in shader, 
                // use attribute.format here to make sure type conversion can be done correctly by graphics api.
                // https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/vertexAttribPointer#integer_attributes
                description.format = attribute.format;
                description.binding = attribute.buffer;
                description.offset = attribute.offset;
                vertexInputState.attributes.add(description);
            }

            const info = new impl.PipelineInfo();
            info.passState = pass;
            info.vertexInputState = vertexInputState;
            info.renderPass = renderPass;
            info.layout = layout;
            pipeline = device.createPipeline();
            pipeline.initialize(info);
            pipelineCache[pipelineHash] = pipeline;
        }
        return pipeline;
    }
}