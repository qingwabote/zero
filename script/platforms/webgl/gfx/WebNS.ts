import NS from "../../../main/core/gfx/NS.js";
import {
    WebAttachmentDescription,
    WebBlendState,
    WebBufferInfo,
    WebDepthStencilState,
    WebDescriptorSetLayoutBinding,
    WebDescriptorSetLayoutInfo,
    WebFramebufferInfo,
    WebIndexInput,
    WebInputAssemblerInfo,
    WebPassState,
    WebPipelineInfo,
    WebPipelineLayoutInfo,
    WebRasterizationState,
    WebRenderPassInfo,
    WebSamplerInfo,
    WebShaderInfo,
    WebSubmitInfo,
    WebTextureInfo,
    WebVector,
    WebVertexInput,
    WebVertexInputAttributeDescription,
    WebVertexInputBindingDescription,
    WebVertexInputState
} from "./info.js";

export default class WebNS implements NS {
    FloatVector = WebVector;
    Uint32Vector = WebVector;
    StringVector = WebVector;

    BufferInfo = WebBufferInfo;

    DescriptorSetLayoutBinding = WebDescriptorSetLayoutBinding;
    DescriptorSetLayoutBindingVector = WebVector;
    DescriptorSetLayoutInfo = WebDescriptorSetLayoutInfo;

    AttachmentDescription = WebAttachmentDescription;
    AttachmentDescriptionVector = WebVector;
    RenderPassInfo = WebRenderPassInfo;

    TextureInfo = WebTextureInfo;

    FramebufferInfo = WebFramebufferInfo;

    SamplerInfo = WebSamplerInfo;

    ShaderInfo = WebShaderInfo;

    DescriptorSetLayoutVector = WebVector;
    PipelineLayoutInfo = WebPipelineLayoutInfo;

    VertexInputBindingDescription = WebVertexInputBindingDescription;
    VertexInputAttributeDescription = WebVertexInputAttributeDescription;
    VertexInputAttributeDescriptionVector = WebVector;
    VertexInputBindingDescriptionVector = WebVector;
    VertexInputState = WebVertexInputState;
    BufferVector = WebVector;
    VertexInput = WebVertexInput;
    IndexInput = WebIndexInput;
    InputAssemblerInfo = WebInputAssemblerInfo;

    RasterizationState = WebRasterizationState;
    DepthStencilState = WebDepthStencilState;
    BlendState = WebBlendState;
    PassState = WebPassState;

    PipelineInfo = WebPipelineInfo;

    SubmitInfo = WebSubmitInfo;
}