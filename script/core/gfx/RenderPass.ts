import { ClearFlagBit } from "./Pipeline.js";

export interface RenderPassInfo {
    clearFlag: ClearFlagBit
}

export default interface RenderPass {
    initialize(info: RenderPassInfo): boolean;
}