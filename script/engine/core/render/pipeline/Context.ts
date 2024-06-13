import { device } from "boot";
import { DescriptorSet, DescriptorSetLayout, PassState, Pipeline, PipelineInfo, PipelineLayout, PipelineLayoutInfo, RenderPass, Shader, VertexAttributeVector } from "gfx";
import { hashLib } from "../hashLib.js";

export class Context {
    readonly descriptorSet: DescriptorSet;

    private _pipelineLayoutCache: Map<Shader, PipelineLayout> = new Map;
    private _pipelineCache: Record<number, Pipeline> = {};

    constructor(private _descriptorSetLayout: DescriptorSetLayout) {
        this.descriptorSet = device.createDescriptorSet(_descriptorSetLayout);
    }

    /**
     * @param renderPass a compatible renderPass
     */
    getPipeline(passState: PassState, attributes: VertexAttributeVector, renderPass: RenderPass, layouts?: readonly DescriptorSetLayout[]): Pipeline {
        const pipelineHash = hashLib.passState(passState) ^ hashLib.attributes(attributes) ^ hashLib.renderPass(renderPass.info);
        let pipeline = this._pipelineCache[pipelineHash];
        if (!pipeline) {
            const info = new PipelineInfo();
            info.passState = passState;
            info.attributes = attributes;
            info.renderPass = renderPass;
            info.layout = this.getPipelineLayout(passState.shader!, layouts)
            pipeline = device.createPipeline(info);
            this._pipelineCache[pipelineHash] = pipeline;
        }
        return pipeline;
    }

    private getPipelineLayout(shader: Shader, layouts?: readonly DescriptorSetLayout[]): PipelineLayout {
        let pipelineLayout = this._pipelineLayoutCache.get(shader);
        if (!pipelineLayout) {
            const info = new PipelineLayoutInfo;
            info.layouts.add(this._descriptorSetLayout);
            if (layouts) {
                for (const layout of layouts) {
                    info.layouts.add(layout);
                }
            }
            pipelineLayout = device.createPipelineLayout(info);
            this._pipelineLayoutCache.set(shader, pipelineLayout);
        }
        return pipelineLayout;
    }
}