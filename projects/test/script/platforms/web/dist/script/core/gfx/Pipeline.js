// copy values from VkPipelineStageFlagBits in vulkan_core.h
export var PipelineStageFlagBits;
(function (PipelineStageFlagBits) {
    PipelineStageFlagBits[PipelineStageFlagBits["PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT"] = 1024] = "PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT";
})(PipelineStageFlagBits || (PipelineStageFlagBits = {}));
// copy values from VkFormat in vulkan_core.h
export var Format;
(function (Format) {
    Format[Format["R8UI"] = 13] = "R8UI";
    Format[Format["R16UI"] = 74] = "R16UI";
    Format[Format["R32UI"] = 98] = "R32UI";
    Format[Format["RG32F"] = 103] = "RG32F";
    Format[Format["RGB32F"] = 106] = "RGB32F";
    Format[Format["RGBA32F"] = 109] = "RGBA32F";
})(Format || (Format = {}));
export const FormatInfos = {
    [Format.R8UI]: { name: "R8UI", size: 1, count: 1 },
    [Format.R16UI]: { name: "R16UI", size: 2, count: 1 },
    [Format.R32UI]: { name: "R32UI", size: 4, count: 1 },
    [Format.RG32F]: { name: "RG32F", size: 8, count: 2 },
    [Format.RGB32F]: { name: "RGB32F", size: 12, count: 3 },
    [Format.RGBA32F]: { name: "RGBA32F", size: 16, count: 4 },
};
// copy values from VkVertexInputRate in vulkan_core.h
export var VertexInputRate;
(function (VertexInputRate) {
    VertexInputRate[VertexInputRate["VERTEX"] = 0] = "VERTEX";
    VertexInputRate[VertexInputRate["INSTANCE"] = 1] = "INSTANCE";
})(VertexInputRate || (VertexInputRate = {}));
// copy values from VkIndexType in vulkan_core.h
export var IndexType;
(function (IndexType) {
    IndexType[IndexType["UINT16"] = 0] = "UINT16";
    IndexType[IndexType["UINT32"] = 1] = "UINT32";
})(IndexType || (IndexType = {}));
// copy values from VkDescriptorType in vulkan_core.h
export var DescriptorType;
(function (DescriptorType) {
    DescriptorType[DescriptorType["SAMPLER_TEXTURE"] = 1] = "SAMPLER_TEXTURE";
    DescriptorType[DescriptorType["UNIFORM_BUFFER"] = 6] = "UNIFORM_BUFFER";
    DescriptorType[DescriptorType["UNIFORM_BUFFER_DYNAMIC"] = 8] = "UNIFORM_BUFFER_DYNAMIC";
})(DescriptorType || (DescriptorType = {}));
export var ClearFlagBit;
(function (ClearFlagBit) {
    ClearFlagBit[ClearFlagBit["NONE"] = 0] = "NONE";
    ClearFlagBit[ClearFlagBit["COLOR"] = 1] = "COLOR";
    ClearFlagBit[ClearFlagBit["DEPTH"] = 2] = "DEPTH";
})(ClearFlagBit || (ClearFlagBit = {}));
// copy values from VkCullModeFlagBits in vulkan_core.h
export var CullMode;
(function (CullMode) {
    CullMode[CullMode["NONE"] = 0] = "NONE";
    CullMode[CullMode["FRONT"] = 1] = "FRONT";
    CullMode[CullMode["BACK"] = 2] = "BACK";
})(CullMode || (CullMode = {}));
export var BlendFactor;
(function (BlendFactor) {
    BlendFactor[BlendFactor["ZERO"] = 0] = "ZERO";
    BlendFactor[BlendFactor["ONE"] = 1] = "ONE";
    // SRC_ALPHA,
    // DST_ALPHA,
    // ONE_MINUS_SRC_ALPHA,
    // ONE_MINUS_DST_ALPHA,
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
//# sourceMappingURL=Pipeline.js.map