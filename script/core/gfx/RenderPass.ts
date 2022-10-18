import { ClearFlagBit } from "./Pipeline.js";

export interface RenderPassInfo {
    clearFlags: ClearFlagBit
}

export default interface RenderPass {
    initialize(info: RenderPassInfo): boolean;
}