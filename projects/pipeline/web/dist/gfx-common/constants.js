// copy values from VkFormat in vulkan_core.h
export var Format;
(function (Format) {
    Format[Format["UNDEFINED"] = 0] = "UNDEFINED";
    Format[Format["R8_UINT"] = 13] = "R8_UINT";
    Format[Format["RGBA8_UNORM"] = 37] = "RGBA8_UNORM";
    Format[Format["RGBA8_UINT"] = 41] = "RGBA8_UINT";
    Format[Format["RGBA8_SRGB"] = 43] = "RGBA8_SRGB";
    Format[Format["R16_UINT"] = 74] = "R16_UINT";
    Format[Format["RGBA16_UINT"] = 95] = "RGBA16_UINT";
    Format[Format["R32_UINT"] = 98] = "R32_UINT";
    Format[Format["RG32_SFLOAT"] = 103] = "RG32_SFLOAT";
    Format[Format["RGB32_SFLOAT"] = 106] = "RGB32_SFLOAT";
    Format[Format["RGBA32_UINT"] = 107] = "RGBA32_UINT";
    Format[Format["RGBA32_SFLOAT"] = 109] = "RGBA32_SFLOAT";
})(Format || (Format = {}));
export const FormatInfos = {
    [Format.UNDEFINED]: { name: "UNDEFINED", bytes: 0, nums: 0 },
    [Format.R8_UINT]: { name: "R8_UINT", bytes: 1, nums: 1 },
    [Format.RGBA8_UNORM]: { name: "RGBA8_UNORM", bytes: 4, nums: 4 },
    [Format.RGBA8_UINT]: { name: "RGBA8_UINT", bytes: 4, nums: 4 },
    [Format.RGBA8_SRGB]: { name: "RGBA8_SRGB", bytes: 4, nums: 4 },
    [Format.R16_UINT]: { name: "R16_UINT", bytes: 2, nums: 1 },
    [Format.RGBA16_UINT]: { name: "RGBA16_UINT", bytes: 8, nums: 4 },
    [Format.R32_UINT]: { name: "R32_UINT", bytes: 4, nums: 1 },
    [Format.RG32_SFLOAT]: { name: "RG32_SFLOAT", bytes: 8, nums: 2 },
    [Format.RGB32_SFLOAT]: { name: "RGB32_SFLOAT", bytes: 12, nums: 3 },
    [Format.RGBA32_UINT]: { name: "RGBA32_UINT", bytes: 16, nums: 4 },
    [Format.RGBA32_SFLOAT]: { name: "RGBA32_SFLOAT", bytes: 16, nums: 4 },
};
// copy values from VkBufferUsageFlagBits in vulkan_core.h
export var BufferUsageFlagBits;
(function (BufferUsageFlagBits) {
    BufferUsageFlagBits[BufferUsageFlagBits["NONE"] = 0] = "NONE";
    BufferUsageFlagBits[BufferUsageFlagBits["TRANSFER_DST"] = 2] = "TRANSFER_DST";
    BufferUsageFlagBits[BufferUsageFlagBits["UNIFORM"] = 16] = "UNIFORM";
    BufferUsageFlagBits[BufferUsageFlagBits["INDEX"] = 64] = "INDEX";
    BufferUsageFlagBits[BufferUsageFlagBits["VERTEX"] = 128] = "VERTEX";
})(BufferUsageFlagBits || (BufferUsageFlagBits = {}));
// copy values from VmaMemoryUsage in vk_men_alloc.h
export var MemoryUsage;
(function (MemoryUsage) {
    MemoryUsage[MemoryUsage["NONE"] = 0] = "NONE";
    MemoryUsage[MemoryUsage["GPU_ONLY"] = 1] = "GPU_ONLY";
    MemoryUsage[MemoryUsage["CPU_TO_GPU"] = 3] = "CPU_TO_GPU";
})(MemoryUsage || (MemoryUsage = {}));
// copy values from VkShaderStageFlagBits in vulkan_core.h
export var ShaderStageFlagBits;
(function (ShaderStageFlagBits) {
    ShaderStageFlagBits[ShaderStageFlagBits["NONE"] = 0] = "NONE";
    ShaderStageFlagBits[ShaderStageFlagBits["VERTEX"] = 1] = "VERTEX";
    ShaderStageFlagBits[ShaderStageFlagBits["FRAGMENT"] = 16] = "FRAGMENT";
})(ShaderStageFlagBits || (ShaderStageFlagBits = {}));
// copy values from VkDescriptorType in vulkan_core.h
export var DescriptorType;
(function (DescriptorType) {
    DescriptorType[DescriptorType["NONE"] = 0] = "NONE";
    DescriptorType[DescriptorType["SAMPLER_TEXTURE"] = 1] = "SAMPLER_TEXTURE";
    DescriptorType[DescriptorType["UNIFORM_BUFFER"] = 6] = "UNIFORM_BUFFER";
    DescriptorType[DescriptorType["UNIFORM_BUFFER_DYNAMIC"] = 8] = "UNIFORM_BUFFER_DYNAMIC";
})(DescriptorType || (DescriptorType = {}));
// copy values from VkSampleCountFlagBits in vulkan_core.h
export var SampleCountFlagBits;
(function (SampleCountFlagBits) {
    SampleCountFlagBits[SampleCountFlagBits["X1"] = 1] = "X1";
    SampleCountFlagBits[SampleCountFlagBits["X2"] = 2] = "X2";
    SampleCountFlagBits[SampleCountFlagBits["X4"] = 4] = "X4";
    SampleCountFlagBits[SampleCountFlagBits["X8"] = 8] = "X8";
})(SampleCountFlagBits || (SampleCountFlagBits = {}));
// copy values from VkImageUsageFlagBits in vulkan_core.h
export var TextureUsageFlagBits;
(function (TextureUsageFlagBits) {
    TextureUsageFlagBits[TextureUsageFlagBits["NONE"] = 0] = "NONE";
    TextureUsageFlagBits[TextureUsageFlagBits["TRANSFER_DST"] = 2] = "TRANSFER_DST";
    TextureUsageFlagBits[TextureUsageFlagBits["SAMPLED"] = 4] = "SAMPLED";
    TextureUsageFlagBits[TextureUsageFlagBits["COLOR"] = 16] = "COLOR";
    TextureUsageFlagBits[TextureUsageFlagBits["DEPTH_STENCIL"] = 32] = "DEPTH_STENCIL";
    TextureUsageFlagBits[TextureUsageFlagBits["TRANSIENT"] = 64] = "TRANSIENT";
})(TextureUsageFlagBits || (TextureUsageFlagBits = {}));
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
    ImageLayout[ImageLayout["COLOR"] = 2] = "COLOR";
    ImageLayout[ImageLayout["DEPTH_STENCIL"] = 3] = "DEPTH_STENCIL";
    ImageLayout[ImageLayout["DEPTH_STENCIL_READ_ONLY"] = 4] = "DEPTH_STENCIL_READ_ONLY";
    ImageLayout[ImageLayout["SHADER_READ_ONLY"] = 5] = "SHADER_READ_ONLY";
    ImageLayout[ImageLayout["PRESENT_SRC"] = 1000001002] = "PRESENT_SRC";
})(ImageLayout || (ImageLayout = {}));
// copy values from VkFilter in vulkan_core.h
export var Filter;
(function (Filter) {
    Filter[Filter["NEAREST"] = 0] = "NEAREST";
    Filter[Filter["LINEAR"] = 1] = "LINEAR";
})(Filter || (Filter = {}));
// copy values from VkSamplerAddressMode in vulkan_core.h
// export enum Address {
//     REPEAT = 0,
// }
// copy values from VkIndexType in vulkan_core.h
export var IndexType;
(function (IndexType) {
    IndexType[IndexType["UINT16"] = 0] = "UINT16";
    IndexType[IndexType["UINT32"] = 1] = "UINT32";
})(IndexType || (IndexType = {}));
//copy values from VkCullModeFlagBits in vulkan_core.h
export var CullMode;
(function (CullMode) {
    CullMode[CullMode["NONE"] = 0] = "NONE";
    CullMode[CullMode["FRONT"] = 1] = "FRONT";
    CullMode[CullMode["BACK"] = 2] = "BACK";
})(CullMode || (CullMode = {}));
// copy values from VkBlendFactor in vulkan_core.h
export var BlendFactor;
(function (BlendFactor) {
    BlendFactor[BlendFactor["ZERO"] = 0] = "ZERO";
    BlendFactor[BlendFactor["ONE"] = 1] = "ONE";
    BlendFactor[BlendFactor["SRC_ALPHA"] = 6] = "SRC_ALPHA";
    BlendFactor[BlendFactor["ONE_MINUS_SRC_ALPHA"] = 7] = "ONE_MINUS_SRC_ALPHA";
    BlendFactor[BlendFactor["DST_ALPHA"] = 8] = "DST_ALPHA";
    BlendFactor[BlendFactor["ONE_MINUS_DST_ALPHA"] = 9] = "ONE_MINUS_DST_ALPHA";
    // SRC_COLOR,
    // DST_COLOR,
    // ONE_MINUS_SRC_COLOR,
    // ONE_MINUS_DST_COLOR,
    // SRC_ALPHA_SATURATE,
    // CONSTANT_COLOR,
    // ONE_MINUS_CONSTANT_COLOR,
    // CONSTANT_ALPHA,
    // ONE_MINUS_CONSTANT_ALPHA,
})(BlendFactor || (BlendFactor = {}));
// copy values from VkPrimitiveTopology in vulkan_core.h
export var PrimitiveTopology;
(function (PrimitiveTopology) {
    PrimitiveTopology[PrimitiveTopology["LINE_LIST"] = 1] = "LINE_LIST";
    PrimitiveTopology[PrimitiveTopology["TRIANGLE_LIST"] = 3] = "TRIANGLE_LIST";
})(PrimitiveTopology || (PrimitiveTopology = {}));
// copy values from VkPipelineStageFlagBits in vulkan_core.h
export var PipelineStageFlagBits;
(function (PipelineStageFlagBits) {
    PipelineStageFlagBits[PipelineStageFlagBits["PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT"] = 1024] = "PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT";
})(PipelineStageFlagBits || (PipelineStageFlagBits = {}));
export var ClearFlagBits;
(function (ClearFlagBits) {
    ClearFlagBits[ClearFlagBits["NONE"] = 0] = "NONE";
    ClearFlagBits[ClearFlagBits["COLOR"] = 1] = "COLOR";
    ClearFlagBits[ClearFlagBits["DEPTH"] = 2] = "DEPTH";
})(ClearFlagBits || (ClearFlagBits = {}));
