import { PipelineInfo, PipelineLayoutInfo } from "./info.js";

export interface PipelineLayout {
    initialize(info: PipelineLayoutInfo): boolean;
}

export enum ClearFlagBits {
    NONE = 0,
    COLOR = 0x1,
    DEPTH = 0x2
}

export interface Pipeline {
    initialize(info: PipelineInfo): boolean;
}