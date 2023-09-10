import type { AttachmentDescription, AttachmentDescriptionVector, BlendState, BufferInfo, BufferVector, DepthStencilState, DescriptorSetLayoutBinding, DescriptorSetLayoutBindingVector, DescriptorSetLayoutInfo, DescriptorSetLayoutVector, FloatVector, FramebufferInfo, IndexInput, InputAssemblerInfo, PassState, PipelineInfo, PipelineLayoutInfo, RasterizationState, RenderPassInfo, SamplerInfo, ShaderInfo, StringVector, SubmitInfo, TextureInfo, Uint32Vector, VertexAttribute, VertexAttributeVector, VertexInput, VertexInputAttributeDescription, VertexInputAttributeDescriptionVector, VertexInputBindingDescription, VertexInputBindingDescriptionVector, VertexInputState } from "./info.js";

export interface Impl {
    readonly FloatVector: new () => FloatVector;
    readonly Uint32Vector: new () => Uint32Vector;
    readonly StringVector: new () => StringVector;

    readonly BufferInfo: new () => BufferInfo;

    readonly DescriptorSetLayoutBinding: new () => DescriptorSetLayoutBinding;
    readonly DescriptorSetLayoutBindingVector: new () => DescriptorSetLayoutBindingVector;
    readonly DescriptorSetLayoutInfo: new () => DescriptorSetLayoutInfo;

    readonly AttachmentDescription: new () => AttachmentDescription;
    readonly AttachmentDescriptionVector: new () => AttachmentDescriptionVector;
    readonly RenderPassInfo: new () => RenderPassInfo;

    readonly TextureInfo: new () => TextureInfo;

    readonly FramebufferInfo: new () => FramebufferInfo;

    readonly SamplerInfo: new () => SamplerInfo;

    readonly ShaderInfo: new () => ShaderInfo;

    readonly DescriptorSetLayoutVector: new () => DescriptorSetLayoutVector;
    readonly PipelineLayoutInfo: new () => PipelineLayoutInfo;

    readonly VertexInputBindingDescription: new () => VertexInputBindingDescription;
    readonly VertexInputAttributeDescription: new () => VertexInputAttributeDescription;
    readonly VertexInputAttributeDescriptionVector: new () => VertexInputAttributeDescriptionVector;
    readonly VertexInputBindingDescriptionVector: new () => VertexInputBindingDescriptionVector;
    readonly VertexInputState: new () => VertexInputState;
    readonly VertexAttribute: new () => VertexAttribute;
    readonly BufferVector: new () => BufferVector;
    readonly VertexInput: new () => VertexInput;
    readonly IndexInput: new () => IndexInput;
    readonly VertexAttributeVector: new () => VertexAttributeVector;
    readonly InputAssemblerInfo: new () => InputAssemblerInfo;

    readonly RasterizationState: new () => RasterizationState;
    readonly DepthStencilState: new () => DepthStencilState;
    readonly BlendState: new () => BlendState;
    readonly PassState: new () => PassState;

    readonly PipelineInfo: new () => PipelineInfo;

    readonly SubmitInfo: new () => SubmitInfo;
}