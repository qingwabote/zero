import type * as main from "gfx-main";

export class Vector<T> implements main.Vector<T> {
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

export const FloatVector = Vector;
export const Uint32Vector = Vector;
export const StringVector = Vector;

export class BufferInfo implements main.BufferInfo {
    usage: main.BufferUsageFlagBits = 0;
    mem_usage: main.MemoryUsage = 0;
    size: number = 0;
    stride: number = 0;

}

export class DescriptorSetLayoutBinding implements main.DescriptorSetLayoutBinding {
    binding: number = 0;
    descriptorType: main.DescriptorType = 0;
    descriptorCount: number = 0;
    stageFlags: main.ShaderStageFlagBits = 0;
}
export const DescriptorSetLayoutBindingVector = Vector;
export class DescriptorSetLayoutInfo implements main.DescriptorSetLayoutInfo {
    bindings: main.DescriptorSetLayoutBindingVector = new Vector;
}

export class AttachmentDescription implements main.AttachmentDescription {
    loadOp: main.LOAD_OP = 0;
    initialLayout: main.ImageLayout = 0;
    finalLayout: main.ImageLayout = 0;
}
export const AttachmentDescriptionVector = Vector;
export class RenderPassInfo {
    colorAttachments: main.AttachmentDescriptionVector = new Vector;
    depthStencilAttachment: main.AttachmentDescription = new AttachmentDescription;
    resolveAttachments: main.AttachmentDescriptionVector = new Vector;
    samples = 1
}

export class TextureInfo implements main.TextureInfo {
    samples: main.SampleCountFlagBits = 1;
    usage: main.TextureUsageBits = 0;
    width: number = 0;
    height: number = 0;
}

export class FramebufferInfo implements main.FramebufferInfo {
    colorAttachments: main.TextureVector = new Vector;
    depthStencilAttachment!: main.Texture;
    resolveAttachments: main.TextureVector = new Vector;
    renderPass!: main.RenderPass;
    width: number = 0;
    height: number = 0;
}

export class SamplerInfo implements main.SamplerInfo {
    magFilter: main.Filter = 0;
    minFilter: main.Filter = 0;
}

export class ShaderInfo implements main.ShaderInfo {
    sources: main.StringVector = new Vector;
    types: main.Uint32Vector = new Vector;
}

export const DescriptorSetLayoutVector = Vector;
export class PipelineLayoutInfo implements main.PipelineLayoutInfo {
    layouts: main.DescriptorSetLayoutVector = new Vector;
}

export class VertexInputBindingDescription implements main.VertexInputBindingDescription {
    binding: number = 0;
    stride: number = 0;
    inputRate: main.VertexInputRate = 0;
}
export class VertexInputAttributeDescription implements main.VertexInputAttributeDescription {
    location: number = 0;
    format: main.Format = 0;
    binding: number = 0;
    offset: number = 0;
}
export const VertexInputAttributeDescriptionVector = Vector;
export const VertexInputBindingDescriptionVector = Vector;
export class VertexInputState implements main.VertexInputState {
    attributes: main.VertexInputAttributeDescriptionVector = new Vector;
    bindings: main.VertexInputBindingDescriptionVector = new Vector;
}
export class VertexAttribute implements main.VertexAttribute {
    name: string = '';
    format: main.Format = 0;
    buffer: number = 0;
    offset: number = 0;
}
export const BufferVector = Vector;
export class VertexInput implements main.VertexInput {
    buffers: main.BufferVector = new Vector;
    offsets: main.Uint32Vector = new Vector;
}
export class IndexInput implements main.IndexInput {
    buffer!: main.Buffer;
    type: main.IndexType = 0;
}
export const VertexAttributeVector = Vector;
export class InputAssemblerInfo implements main.InputAssemblerInfo {
    vertexAttributes: main.VertexAttributeVector = new Vector;
    vertexInput!: main.VertexInput;
    indexInput?: main.IndexInput = undefined;
}

export class RasterizationState implements main.RasterizationState {
    cullMode: main.CullMode = 0;
}

export class DepthStencilState implements main.DepthStencilState {
    depthTestEnable: boolean = false;
}

export class BlendState implements main.BlendState {
    srcRGB: main.BlendFactor = 0;
    dstRGB: main.BlendFactor = 0;
    srcAlpha: main.BlendFactor = 0;
    dstAlpha: main.BlendFactor = 0;
}

export class PassState implements main.PassState {
    shader!: main.Shader;
    primitive!: main.PrimitiveTopology;
    rasterizationState!: main.RasterizationState;
    depthStencilState?: main.DepthStencilState = undefined;
    blendState?: main.BlendState = undefined;
}

export class PipelineInfo implements main.PipelineInfo {
    vertexInputState!: main.VertexInputState;
    passState!: main.PassState;
    layout!: main.PipelineLayout;
    renderPass!: main.RenderPass;
}

export class SubmitInfo implements main.SubmitInfo {
    commandBuffer!: main.CommandBuffer;
    waitSemaphore?: main.Semaphore = undefined;
    waitDstStageMask?: main.PipelineStageFlagBits = undefined;
    signalSemaphore?: main.Semaphore = undefined;
}
