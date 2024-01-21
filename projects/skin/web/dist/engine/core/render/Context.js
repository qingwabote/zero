import { device } from "boot";
import { PipelineInfo, PipelineLayoutInfo } from "gfx";
import { hashLib } from "./hashLib.js";
export class Context {
    constructor(_descriptorSetLayout) {
        this._descriptorSetLayout = _descriptorSetLayout;
        this._pipelineLayoutCache = new Map;
        this._pipelineCache = {};
        this.cameraIndex = 0;
        const pipelineLayoutInfo = new PipelineLayoutInfo;
        pipelineLayoutInfo.layouts.add(_descriptorSetLayout);
        this.descriptorSet = device.createDescriptorSet(_descriptorSetLayout);
    }
    /**
     * @param renderPass a compatible renderPass
     */
    getPipeline(passState, inputAssembler, renderPass, layouts = []) {
        const inputAssemblerInfo = inputAssembler.info;
        const pipelineHash = hashLib.passState(passState) ^ hashLib.inputAssembler(inputAssemblerInfo) ^ hashLib.renderPass(renderPass.info);
        let pipeline = this._pipelineCache[pipelineHash];
        if (!pipeline) {
            const info = new PipelineInfo();
            info.passState = passState;
            info.inputAssembler = inputAssembler;
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
            for (const layout of layouts) {
                info.layouts.add(layout);
            }
            pipelineLayout = device.createPipelineLayout(info);
            this._pipelineLayoutCache.set(shader, pipelineLayout);
        }
        return pipelineLayout;
    }
}
