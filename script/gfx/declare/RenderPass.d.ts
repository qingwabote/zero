import { RenderPassInfo } from "./info.js";

export declare class RenderPass {
    get info(): RenderPassInfo;
    initialize(info: RenderPassInfo): boolean;
}