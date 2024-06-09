import { RenderPassInfo } from './info.js';

export class RenderPass {
    constructor(readonly info: RenderPassInfo) { }

    initialize(): boolean { return false; }
}