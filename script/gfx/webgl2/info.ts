import { BlendFactor, BufferUsageFlagBits, CullMode, DescriptorType, Filter, Format, ImageLayout, IndexType, LOAD_OP, MemoryUsage, PipelineStageFlagBits, PrimitiveTopology, SampleCountFlagBits, ShaderStageFlagBits, TextureUsageFlagBits } from "gfx-common";
import { Buffer } from "./Buffer.js";
import { CommandBuffer } from "./CommandBuffer.js";
import { DescriptorSetLayout } from "./DescriptorSetLayout.js";
import { PipelineLayout } from "./PipelineLayout.js";
import { RenderPass } from "./RenderPass.js";
import { Semaphore } from "./Semaphore.js";
import { Shader } from "./Shader.js";
import { Texture } from "./Texture.js";

export abstract class Vector<T> {
    data: Array<T> = [];

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

export class FloatVector extends Vector<number> { };
export class Uint32Vector extends Vector<number> { };
export class StringVector extends Vector<string> { };


export class BufferInfo {
    usage: BufferUsageFlagBits = 0;
    mem_usage: MemoryUsage = 0;
    size: number = 0;
}

export class DescriptorSetLayoutBinding {
    binding: number = 0;
    descriptorType: DescriptorType = 0;
    descriptorCount: number = 0;
    stageFlags: ShaderStageFlagBits = 0;
}
export class DescriptorSetLayoutBindingVector extends Vector<DescriptorSetLayoutBinding> { };
export class DescriptorSetLayoutInfo {
    bindings: DescriptorSetLayoutBindingVector = new DescriptorSetLayoutBindingVector;
}

export class AttachmentDescription {
    loadOp: LOAD_OP = 0;
    initialLayout: ImageLayout = 0;
    finalLayout: ImageLayout = 0;
}
export class AttachmentDescriptionVector extends Vector<AttachmentDescription> { };
export class RenderPassInfo {
    colors: AttachmentDescriptionVector = new AttachmentDescriptionVector;
    depthStencil: AttachmentDescription = new AttachmentDescription;
    resolves: AttachmentDescriptionVector = new AttachmentDescriptionVector;
    samples = SampleCountFlagBits.X1;
}

export class TextureInfo {
    samples: SampleCountFlagBits = SampleCountFlagBits.X1;
    usage: TextureUsageFlagBits = TextureUsageFlagBits.NONE;
    width: number = 0;
    height: number = 0;
    swapchain = false;
}

export class TextureVector extends Vector<Texture> { };
export class FramebufferInfo {
    colors: TextureVector = new TextureVector;
    depthStencil: Texture | null = null;
    resolves: TextureVector = new TextureVector;
    renderPass: RenderPass | null = null;
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

export class DescriptorSetLayoutVector extends Vector<DescriptorSetLayout> { };
export class PipelineLayoutInfo {
    layouts: DescriptorSetLayoutVector = new DescriptorSetLayoutVector;
}

export class VertexAttribute {
    location: number = 0;
    format: Format = 0;
    buffer: number = 0;
    offset: number = 0;
    stride: number = 0;
    instanced: boolean = false;
    multiple: number = 1;
}
export class BufferVector extends Vector<Buffer> { };
export class VertexInput {
    buffers = new BufferVector;
    offsets = new Uint32Vector;
}
export class IndexInput {
    buffer: Buffer | null = null;
    type: IndexType = 0;
}
export class VertexAttributeVector extends Vector<VertexAttribute> { };
export class InputAssembler {
    vertexAttributes = new VertexAttributeVector;
    vertexInput = new VertexInput;
    indexInput: IndexInput | null = null;
}

export class RasterizationState {
    cullMode = CullMode.NONE;
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
    shader: Shader | null = null;
    primitive: PrimitiveTopology = (0 as PrimitiveTopology);
    rasterizationState = new RasterizationState;
    depthStencilState: DepthStencilState | null = null;
    blendState: BlendState | null = null;
}

export class PipelineInfo implements PipelineInfo {
    passState: PassState | null = null;
    attributes: VertexAttributeVector | null = null;
    layout: PipelineLayout | null = null;
    renderPass: RenderPass | null = null;
}

export class SubmitInfo implements SubmitInfo {
    commandBuffer: CommandBuffer | null = null;
    waitSemaphore: Semaphore | null = null;
    waitDstStageMask: PipelineStageFlagBits = (0 as PipelineStageFlagBits);
    signalSemaphore: Semaphore | null = null;
}
