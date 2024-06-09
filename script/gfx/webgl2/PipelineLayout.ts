import { PipelineLayoutInfo } from "./info";

export class PipelineLayout {
    constructor(readonly info: PipelineLayoutInfo) { }

    initialize(): boolean { return false; }
}