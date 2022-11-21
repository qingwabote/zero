// copy values from VkAttachmentLoadOp in vulkan_core.h
export var LOAD_OP;
(function (LOAD_OP) {
    LOAD_OP[LOAD_OP["LOAD"] = 0] = "LOAD";
    LOAD_OP[LOAD_OP["CLEAR"] = 1] = "CLEAR";
})(LOAD_OP || (LOAD_OP = {}));
// copy values from VkImageLayout in vulkan_core.h
export var ImageLayout;
(function (ImageLayout) {
    ImageLayout[ImageLayout["UNDEFINED"] = 0] = "UNDEFINED";
    ImageLayout[ImageLayout["DEPTH_STENCIL_ATTACHMENT_OPTIMAL"] = 3] = "DEPTH_STENCIL_ATTACHMENT_OPTIMAL";
    ImageLayout[ImageLayout["DEPTH_STENCIL_READ_ONLY_OPTIMAL"] = 4] = "DEPTH_STENCIL_READ_ONLY_OPTIMAL";
    ImageLayout[ImageLayout["PRESENT_SRC"] = 1000001002] = "PRESENT_SRC";
})(ImageLayout || (ImageLayout = {}));
//# sourceMappingURL=RenderPass.js.map