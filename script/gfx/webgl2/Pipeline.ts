import { PipelineInfo } from './info.js';

export class Pipeline {
    constructor(readonly info: PipelineInfo) { }

    initialize(): boolean { return false; }
} 