// copy values from VkImageUsageFlagBits in vulkan_core.h
export var TextureUsageBit;
(function (TextureUsageBit) {
    TextureUsageBit[TextureUsageBit["TRANSFER_DST"] = 2] = "TRANSFER_DST";
    TextureUsageBit[TextureUsageBit["SAMPLED"] = 4] = "SAMPLED";
    TextureUsageBit[TextureUsageBit["COLOR_ATTACHMENT"] = 16] = "COLOR_ATTACHMENT";
    TextureUsageBit[TextureUsageBit["DEPTH_STENCIL_ATTACHMENT"] = 32] = "DEPTH_STENCIL_ATTACHMENT";
})(TextureUsageBit || (TextureUsageBit = {}));
//# sourceMappingURL=Texture.js.map