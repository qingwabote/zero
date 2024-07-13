import { empty } from "bastard";
import { device } from "boot";
import { DescriptorSet, DescriptorSetLayout, Pipeline, PipelineInfo, PipelineLayout, PipelineLayoutInfo, RasterizationState, RenderPass, Shader, VertexInputState } from "gfx";
import { shaderLib } from "../../shaderLib.js";
import { hashLib } from "../hashLib.js";
import { Pass } from "../scene/Pass.js";

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
    getPipeline(passState: Pass.State, inputState: VertexInputState, renderPass: RenderPass, layouts: readonly DescriptorSetLayout[] = empty.arr): Pipeline {
        const pipelineHash = hashLib.passState(passState) ^ hashLib.inputState(inputState) ^ hashLib.renderPass(renderPass.info);
        let pipeline = this._pipelineCache[pipelineHash];
        if (!pipeline) {
            const info = new PipelineInfo();
            info.inputState = inputState;

            info.shader = passState.shader;
            info.rasterizationState = passState.rasterizationState || new RasterizationState;
            if (passState.depthStencilState) {
                info.depthStencilState = passState.depthStencilState;
            }
            if (passState.blendState) {
                info.blendState = passState.blendState;
            }

            info.renderPass = renderPass;
            info.layout = this.getPipelineLayout(passState.shader!, layouts)
            this._pipelineCache[pipelineHash] = pipeline = device.createPipeline(info);
        }
        return pipeline;
    }

    private getPipelineLayout(shader: Shader, layouts: readonly DescriptorSetLayout[]): PipelineLayout {
        let pipelineLayout = this._pipelineLayoutCache.get(shader);
        if (!pipelineLayout) {
            const info = new PipelineLayoutInfo;
            info.layouts.add(this._descriptorSetLayout);
            info.layouts.add(shaderLib.getDescriptorSetLayout(shaderLib.getShaderMeta(shader), shaderLib.sets.material.index));
            for (const layout of layouts) {
                info.layouts.add(layout);
            }
            this._pipelineLayoutCache.set(shader, pipelineLayout = device.createPipelineLayout(info));
        }
        return pipelineLayout;
    }
}