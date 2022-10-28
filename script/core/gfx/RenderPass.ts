import { ClearFlagBit } from "./Pipeline.js";

export interface RenderPassInfo {
    clearFlags: ClearFlagBit,
    hash: string
}

export default interface RenderPass {
    get info(): RenderPassInfo;
    initialize(info: RenderPassInfo): boolean;
}