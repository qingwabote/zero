import { SampleCountFlagBits } from "./Pipeline.js";

// copy values from VkAttachmentLoadOp in vulkan_core.h
export enum LOAD_OP {
    LOAD = 0,
    CLEAR = 1,
}

// copy values from VkImageLayout in vulkan_core.h
export enum ImageLayout {
    UNDEFINED = 0,
    COLOR_ATTACHMENT_OPTIMAL = 2,
    DEPTH_STENCIL_ATTACHMENT_OPTIMAL = 3,
    DEPTH_STENCIL_READ_ONLY_OPTIMAL = 4,
    PRESENT_SRC = 1000001002,
}

export interface AttachmentDescription {
    // format: Format;
    loadOp: LOAD_OP;
    initialLayout: ImageLayout;
    finalLayout: ImageLayout;
}

export class RenderPassInfo {
    constructor(
        readonly colorAttachments: readonly AttachmentDescription[],
        readonly depthStencilAttachment: AttachmentDescription,
        readonly resolveAttachments: readonly AttachmentDescription[] = [],
        readonly samples = SampleCountFlagBits.SAMPLE_COUNT_1
    ) {
    }
}

export default interface RenderPass {
    get info(): RenderPassInfo;
    initialize(info: RenderPassInfo): boolean;
}