import Buffer from "../../../main/core/gfx/Buffer.js";
import CommandBuffer from "../../../main/core/gfx/CommandBuffer.js";
import Format from "../../../main/core/gfx/Format.js";
import { PipelineLayout } from "../../../main/core/gfx/Pipeline.js";
import RenderPass from "../../../main/core/gfx/RenderPass.js";
import Semaphore from "../../../main/core/gfx/Semaphore.js";
import Shader from "../../../main/core/gfx/Shader.js";
import Texture from "../../../main/core/gfx/Texture.js";
import { AttachmentDescription, AttachmentDescriptionVector, BlendFactor, BlendState, BufferInfo, BufferUsageFlagBits, BufferVector, CullMode, DepthStencilState, DescriptorSetLayoutBinding, DescriptorSetLayoutBindingVector, DescriptorSetLayoutInfo, DescriptorSetLayoutVector, DescriptorType, Filter, FramebufferInfo, ImageLayout, IndexInput, IndexType, InputAssemblerInfo, LOAD_OP, MemoryUsage, PassState, PipelineInfo, PipelineLayoutInfo, PipelineStageFlagBits, PrimitiveTopology, RasterizationState, SampleCountFlagBits, SamplerInfo, ShaderInfo, ShaderStageFlagBits, StringVector, SubmitInfo, TextureInfo, TextureUsageBits, TextureVector, Uint32Vector, Vector, VertexInput, VertexInputAttributeDescription, VertexInputAttributeDescriptionVector, VertexInputBindingDescription, VertexInputBindingDescriptionVector, VertexInputRate, VertexInputState } from "../../../main/core/gfx/info.js";

export class WebVector<T> implements Vector<T> {
    readonly data: Array<T> = [];

    size(): number {
        return this.data.length
    }
    get(i: number): T {
        return this.data[i];
    }
    add(v: T): void {
        this.data.push(v);
    }
}

export class WebBufferInfo implements BufferInfo {
    usage: BufferUsageFlagBits = 0;
    mem_usage: MemoryUsage = 0;
    size: number = 0;
    stride: number = 0;

}

export class WebDescriptorSetLayoutBinding implements DescriptorSetLayoutBinding {
    binding: number = 0;
    descriptorType: DescriptorType = 0;
    descriptorCount: number = 0;
    stageFlags: ShaderStageFlagBits = 0;
}
export class WebDescriptorSetLayoutInfo implements DescriptorSetLayoutInfo {
    bindings: DescriptorSetLayoutBindingVector = new WebVector;
}

export class WebAttachmentDescription implements AttachmentDescription {
    loadOp: LOAD_OP = 0;
    initialLayout: ImageLayout = 0;
    finalLayout: ImageLayout = 0;
}
export class WebRenderPassInfo {
    colorAttachments: AttachmentDescriptionVector = new WebVector;
    depthStencilAttachment: AttachmentDescription = new WebAttachmentDescription;
    resolveAttachments: AttachmentDescriptionVector = new WebVector;
    samples = SampleCountFlagBits.SAMPLE_COUNT_1
}

export class WebTextureInfo implements TextureInfo {
    samples: SampleCountFlagBits = SampleCountFlagBits.SAMPLE_COUNT_1;
    usage: TextureUsageBits = 0;
    width: number = 0;
    height: number = 0;
}

export class WebFramebufferInfo implements FramebufferInfo {
    colorAttachments: TextureVector = new WebVector;
    depthStencilAttachment!: Texture;
    resolveAttachments: TextureVector = new WebVector;
    renderPass!: RenderPass;
    width: number = 0;
    height: number = 0;
}

export class WebSamplerInfo implements SamplerInfo {
    magFilter: Filter = 0;
    minFilter: Filter = 0;
}

export class WebShaderInfo implements ShaderInfo {
    sources: StringVector = new WebVector;
    types: Uint32Vector = new WebVector;
}

export class WebPipelineLayoutInfo implements PipelineLayoutInfo {
    layouts: DescriptorSetLayoutVector = new WebVector;
}

export class WebVertexInputBindingDescription implements VertexInputBindingDescription {
    binding: number = 0;
    stride: number = 0;
    inputRate: VertexInputRate = 0;
}
export class WebVertexInputAttributeDescription implements VertexInputAttributeDescription {
    location: number = 0;
    format: Format = 0;
    binding: number = 0;
    offset: number = 0;
}
export class WebVertexInputState implements VertexInputState {
    attributes: VertexInputAttributeDescriptionVector = new WebVector;
    bindings: VertexInputBindingDescriptionVector = new WebVector;
}
export class WebVertexInput implements VertexInput {
    buffers: BufferVector = new WebVector;
    offsets: Uint32Vector = new WebVector;
}
export class WebIndexInput implements IndexInput {
    buffer!: Buffer;
    offset: number = 0;
    type: IndexType = 0;
}
export class WebInputAssemblerInfo implements InputAssemblerInfo {
    vertexInputState!: VertexInputState;
    vertexInput!: VertexInput;
    indexInput?: IndexInput;
}

export class WebRasterizationState implements RasterizationState {
    cullMode: CullMode = 0;
}

export class WebDepthStencilState implements DepthStencilState {
    depthTestEnable: boolean = false;
}

export class WebBlendState implements BlendState {
    srcRGB: BlendFactor = 0;
    dstRGB: BlendFactor = 0;
    srcAlpha: BlendFactor = 0;
    dstAlpha: BlendFactor = 0;
}

export class WebPassState implements PassState {
    shader!: Shader;
    primitive!: PrimitiveTopology;
    rasterizationState!: RasterizationState;
    depthStencilState?: DepthStencilState;
    blendState?: BlendState;
}

export class WebPipelineInfo implements PipelineInfo {
    vertexInputState!: VertexInputState;
    passState!: PassState;
    layout!: PipelineLayout;
    renderPass!: RenderPass;
}

export class WebSubmitInfo implements SubmitInfo {
    commandBuffer!: CommandBuffer;
    waitSemaphore?: Semaphore;
    waitDstStageMask?: PipelineStageFlagBits;
    signalSemaphore?: Semaphore;
}
