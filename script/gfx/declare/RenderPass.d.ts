import { RenderPassInfo } from "./info.js";

export declare class RenderPass {
    get info(): RenderPassInfo;
    private constructor(...args);
    initialize(info: RenderPassInfo): boolean;
}