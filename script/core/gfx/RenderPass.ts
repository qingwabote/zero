
// copy values from VkAttachmentLoadOp in vulkan_core.h
export enum LOAD_OP {
    LOAD = 0,
    CLEAR = 1,
}

// copy values from VkImageLayout in vulkan_core.h
export enum ImageLayout {
    UNDEFINED = 0,
    DEPTH_STENCIL_ATTACHMENT_OPTIMAL = 3,
    PRESENT_SRC = 1000001002,
}

export interface AttachmentDescription {
    // format: Format;
    loadOp: LOAD_OP;
    initialLayout: ImageLayout;
    finalLayout: ImageLayout;
}

export interface RenderPassInfo {
    colorAttachments: AttachmentDescription[];
    depthStencilAttachment: AttachmentDescription;
    hash: string
}

export default interface RenderPass {
    get info(): RenderPassInfo;
    initialize(info: RenderPassInfo): boolean;
}