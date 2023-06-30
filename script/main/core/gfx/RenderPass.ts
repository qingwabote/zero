import { RenderPassInfo } from "./info.js";

export default interface RenderPass {
    get info(): RenderPassInfo;
    initialize(info: RenderPassInfo): boolean;
}