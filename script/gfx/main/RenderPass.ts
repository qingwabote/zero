import { RenderPassInfo } from "./info.js";

export interface RenderPass {
    get info(): RenderPassInfo;
    initialize(info: RenderPassInfo): boolean;
}