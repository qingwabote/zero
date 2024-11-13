import { device } from "boot";
import { PipelineInfo, PipelineLayoutInfo, RasterizationState } from "gfx";
import { hashLib } from "../hashLib.js";
export class FlowContext {
    constructor(_descriptorSetLayout) {
        this._descriptorSetLayout = _descriptorSetLayout;
        this._pipelineLayoutCache = new Map;
        this._pipelineCache = {};
        this.descriptorSet = device.createDescriptorSet(_descriptorSetLayout);
    }
    /**
     * @param renderPass a compatible renderPass
     */
    getPipeline(passState, inputState, renderPass, layouts) {
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
            info.layout = this.getPipelineLayout(passState.shader, layouts);
            pipeline = device.createPipeline(info);
            this._pipelineCache[pipelineHash] = pipeline;
        }
        return pipeline;
    }
    getPipelineLayout(shader, layouts) {
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
