import { BlendFactor, BufferUsageFlagBits, CullMode, DescriptorType, Filter, Format, ImageLayout, IndexType, LOAD_OP, MemoryUsage, PipelineStageFlagBits, PrimitiveTopology, SampleCountFlagBits, ShaderStageFlagBits, TextureUsageBits, VertexInputRate } from "gfx-common";
import { Buffer } from "./Buffer.js";
import { CommandBuffer } from "./CommandBuffer.js";
import { DescriptorSetLayout } from "./DescriptorSetLayout.js";
import { PipelineLayout } from "./PipelineLayout.js";
import { RenderPass } from "./RenderPass.js";
import { Semaphore } from "./Semaphore.js";
import { Shader } from "./Shader.js";
import { Texture } from "./Texture.js";

export abstract class Vector<T> {
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

export class FloatVector extends Vector<number>{ };
export class Uint32Vector extends Vector<number>{ };
export class StringVector extends Vector<string>{ };


export class BufferInfo {
    usage: BufferUsageFlagBits = 0;
    mem_usage: MemoryUsage = 0;
    size: number = 0;
    stride: number = 0;

}

export class DescriptorSetLayoutBinding {
    binding: number = 0;
    descriptorType: DescriptorType = 0;
    descriptorCount: number = 0;
    stageFlags: ShaderStageFlagBits = 0;
}
export class DescriptorSetLayoutBindingVector extends Vector<DescriptorSetLayoutBinding>{ };
export class DescriptorSetLayoutInfo {
    bindings: DescriptorSetLayoutBindingVector = new DescriptorSetLayoutBindingVector;
}

export class AttachmentDescription {
    loadOp: LOAD_OP = 0;
    initialLayout: ImageLayout = 0;
    finalLayout: ImageLayout = 0;
}
export class AttachmentDescriptionVector extends Vector<AttachmentDescription>{ };
export class RenderPassInfo {
    colorAttachments: AttachmentDescriptionVector = new AttachmentDescriptionVector;
    depthStencilAttachment: AttachmentDescription = new AttachmentDescription;
    resolveAttachments: AttachmentDescriptionVector = new AttachmentDescriptionVector;
    samples = 1
}

export class TextureInfo {
    samples: SampleCountFlagBits = 1;
    usage: TextureUsageBits = 0;
    width: number = 0;
    height: number = 0;
}

export class TextureVector extends Vector<Texture>{ };
export class FramebufferInfo {
    colorAttachments: TextureVector = new TextureVector;
    depthStencilAttachment!: Texture;
    resolveAttachments: TextureVector = new TextureVector;
    renderPass!: RenderPass;
    width: number = 0;
    height: number = 0;
}

export class SamplerInfo {
    magFilter: Filter = 0;
    minFilter: Filter = 0;
}

export class ShaderInfo {
    sources: StringVector = new StringVector;
    types: Uint32Vector = new Uint32Vector;
}

export class DescriptorSetLayoutVector extends Vector<DescriptorSetLayout>{ };
export class PipelineLayoutInfo {
    layouts: DescriptorSetLayoutVector = new DescriptorSetLayoutVector;
}

export class VertexInputBindingDescription {
    binding: number = 0;
    stride: number = 0;
    inputRate: VertexInputRate = 0;
}
export class VertexInputAttributeDescription {
    location: number = 0;
    format: Format = 0;
    binding: number = 0;
    offset: number = 0;
}
export class VertexInputAttributeDescriptionVector extends Vector<VertexInputAttributeDescription>{ };
export class VertexInputBindingDescriptionVector extends Vector<VertexInputBindingDescription>{ };
export class VertexInputState {
    attributes: VertexInputAttributeDescriptionVector = new VertexInputAttributeDescriptionVector;
    bindings: VertexInputBindingDescriptionVector = new VertexInputBindingDescriptionVector;
}
export class VertexAttribute {
    name: string = '';
    format: Format = 0;
    buffer: number = 0;
    offset: number = 0;
}
export class BufferVector extends Vector<Buffer>{ };
export class VertexInput {
    buffers: BufferVector = new BufferVector;
    offsets: Uint32Vector = new Uint32Vector;
}
export class IndexInput {
    buffer!: Buffer;
    type: IndexType = 0;
}
export class VertexAttributeVector extends Vector<VertexAttribute>{ };
export class InputAssemblerInfo {
    vertexAttributes: VertexAttributeVector = new VertexAttributeVector;
    vertexInput!: VertexInput;
    indexInput?: IndexInput = undefined;
}

export class RasterizationState {
    cullMode: CullMode = 0;
}

export class DepthStencilState {
    depthTestEnable: boolean = false;
}

export class BlendState {
    srcRGB: BlendFactor = 0;
    dstRGB: BlendFactor = 0;
    srcAlpha: BlendFactor = 0;
    dstAlpha: BlendFactor = 0;
}

export class PassState {
    shader!: Shader;
    primitive!: PrimitiveTopology;
    rasterizationState!: RasterizationState;
    depthStencilState?: DepthStencilState = undefined;
    blendState?: BlendState = undefined;
}

export class PipelineInfo implements PipelineInfo {
    vertexInputState!: VertexInputState;
    passState!: PassState;
    layout!: PipelineLayout;
    renderPass!: RenderPass;
}

export class SubmitInfo implements SubmitInfo {
    commandBuffer!: CommandBuffer;
    waitSemaphore?: Semaphore = undefined;
    waitDstStageMask?: PipelineStageFlagBits = undefined;
    signalSemaphore?: Semaphore = undefined;
}
