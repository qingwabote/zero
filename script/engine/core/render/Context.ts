import { device } from "boot";
import { DescriptorSet, DescriptorSetLayout, FormatInfos, InputAssembler, PassState, Pipeline, PipelineInfo, PipelineLayout, PipelineLayoutInfo, RenderPass, Shader, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "gfx";
import { hashLib } from "../../pipeline/phases/internal/hashLib.js";
import { shaderLib } from "../shaderLib.js";
import { Flow } from "./pipeline/Flow.js";
import { Pass } from "./scene/Pass.js";

export class Context {
    readonly descriptorSet: DescriptorSet;

    private _pipelineLayoutCache: Map<Shader, PipelineLayout> = new Map;
    private _pipelineCache: Record<number, Pipeline> = {};

    flow!: Flow;// FIXME

    constructor(
        readonly descriptorSetLayout: DescriptorSetLayout
    ) {
        const pipelineLayoutInfo = new PipelineLayoutInfo;
        pipelineLayoutInfo.layouts.add(descriptorSetLayout);
        this.descriptorSet = device.createDescriptorSet(descriptorSetLayout);
    }

    getPipelineLayout(layout: DescriptorSetLayout, pass: Pass): PipelineLayout {
        const shader = pass.state.shader;
        let pipelineLayout = this._pipelineLayoutCache.get(shader);
        if (!pipelineLayout) {
            const info = new PipelineLayoutInfo;
            info.layouts.add(this.descriptorSetLayout);
            info.layouts.add(layout);
            if (pass.descriptorSet) {
                info.layouts.add(pass.descriptorSet.layout);
            }
            pipelineLayout = device.createPipelineLayout(info);
            this._pipelineLayoutCache.set(shader, pipelineLayout);
        }
        return pipelineLayout;
    }

    /**
     * @param renderPass a compatible renderPass
     */
    getPipeline(pass: PassState, inputAssembler: InputAssembler, renderPass: RenderPass, layout: PipelineLayout): Pipeline {
        const inputAssemblerInfo = inputAssembler.info;
        const pipelineHash = hashLib.passState(pass) ^ hashLib.inputAssembler(inputAssemblerInfo) ^ hashLib.renderPass(renderPass.info);
        let pipeline = this._pipelineCache[pipelineHash];
        if (!pipeline) {
            const vertexInputState = new VertexInputState;
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
                const description = new VertexInputBindingDescription;
                description.binding = binding;
                description.stride = stride;
                description.inputRate = VertexInputRate.VERTEX;
                vertexInputState.bindings.add(description);
            }
            for (let i = 0; i < vertexAttributesSize; i++) {
                const attribute = vertexAttributes.get(i);
                if (attribute.name == '') {
                    throw new Error("no attribute name is provided");
                }
                const definition = shaderLib.getShaderMeta(pass.shader).attributes[attribute.name];
                if (!definition) {
                    continue;
                }

                const description = new VertexInputAttributeDescription;
                description.location = definition.location;
                // attribute.format in buffer can be different from definition.format in shader, 
                // use attribute.format here to make sure type conversion can be done correctly by graphics api.
                // https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/vertexAttribPointer#integer_attributes
                description.format = attribute.format;
                description.binding = attribute.buffer;
                description.offset = attribute.offset;
                vertexInputState.attributes.add(description);
            }

            const info = new PipelineInfo();
            info.passState = pass;
            info.vertexInputState = vertexInputState;
            info.renderPass = renderPass;
            info.layout = layout;
            pipeline = device.createPipeline(info);
            this._pipelineCache[pipelineHash] = pipeline;
        }
        return pipeline;
    }
}