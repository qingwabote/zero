import { PipelineInfo, PipelineLayoutInfo } from "./info.js";

export declare class PipelineLayout {
    private constructor(...args);
    initialize(info: PipelineLayoutInfo): boolean;
}

export declare class Pipeline {
    private constructor(...args);
    initialize(info: PipelineInfo): boolean;
}