import { BlendFactor, BufferUsageFlagBits, CullMode, DescriptorType, Filter, Format, ImageLayout, IndexType, LOAD_OP, MemoryUsage, PipelineStageFlagBits, PrimitiveTopology, SampleCountFlagBits, ShaderStageFlagBits, TextureUsageBits, VertexInputRate } from "gfx-common";
import { Buffer } from "./Buffer.js";
import { CommandBuffer } from "./CommandBuffer.js";
import { DescriptorSetLayout } from "./DescriptorSetLayout.js";
import { PipelineLayout } from "./Pipeline.js";
import { RenderPass } from "./RenderPass.js";
import { Semaphore } from "./Semaphore.js";
import { Shader } from "./Shader.js";
import { Texture } from "./Texture.js";

export declare abstract class Vector<T> {
    size(): number;
    get(i: number): T;
    add(v: T): void;
}

export declare class FloatVector extends Vector<number>{ }
export declare class Uint32Vector extends Vector<number>{ };
export declare class StringVector extends Vector<string>{ };

export declare class BufferInfo {
    usage: BufferUsageFlagBits;
    mem_usage: MemoryUsage;
    size: number;
    /**
     * When byteStride of the referenced bufferView is not defined, 
     * it means that accessor elements are tightly packed, 
     * i.e., effective stride equals the size of the element.
     * https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#data-alignment
     */
    stride: number;
    // readonly offset: number
}

export declare class DescriptorSetLayoutBinding {
    binding: number;
    descriptorType: DescriptorType;
    descriptorCount: number;
    stageFlags: ShaderStageFlagBits;
}

export class DescriptorSetLayoutBindingVector extends Vector<DescriptorSetLayoutBinding>{ };

export declare class DescriptorSetLayoutInfo {
    bindings: DescriptorSetLayoutBindingVector;
}

export declare class TextureInfo {
    samples: SampleCountFlagBits;
    usage: TextureUsageBits;
    width: number;
    height: number;
}

export class TextureVector extends Vector<Texture>{ };

export declare class FramebufferInfo {
    colorAttachments: TextureVector;
    depthStencilAttachment: Texture;
    resolveAttachments: TextureVector;
    renderPass: RenderPass;
    width: number;
    height: number;
}

export declare class AttachmentDescription {
    // format: Format;
    loadOp: LOAD_OP;
    initialLayout: ImageLayout;
    finalLayout: ImageLayout;
}
export class AttachmentDescriptionVector extends Vector<AttachmentDescription>{ };
export declare class RenderPassInfo {
    colorAttachments: AttachmentDescriptionVector;
    depthStencilAttachment: AttachmentDescription;
    resolveAttachments: AttachmentDescriptionVector;
    samples: SampleCountFlagBits
}

export declare class SamplerInfo {
    magFilter: Filter;
    minFilter: Filter;
}

export declare class ShaderInfo {
    readonly sources: StringVector;
    readonly types: Vector<ShaderStageFlagBits>;
}

export class DescriptorSetLayoutVector extends Vector<DescriptorSetLayout>{ };
export declare class PipelineLayoutInfo {
    layouts: DescriptorSetLayoutVector
}

export declare class VertexAttribute {
    name: string
    format: Format
    buffer: number
    offset: number
}
export class VertexAttributeVector extends Vector<VertexAttribute>{ };

export class BufferVector extends Vector<Buffer>{ };
export declare class VertexInput {
    buffers: BufferVector;
    offsets: FloatVector;
}

export declare class IndexInput {
    buffer: Buffer;
    // offset: number; // WebGL can not specify the offset of the index buffer at buffer binding
    type: IndexType;
}
export declare class InputAssemblerInfo {
    vertexAttributes: VertexAttributeVector;
    vertexInput: VertexInput;
    indexInput?: IndexInput;
}

export declare class RasterizationState {
    cullMode: CullMode;
}
export declare class DepthStencilState {
    depthTestEnable: boolean;
}

/**color(RGB) = (sourceColor * srcRGB) + (destinationColor * dstRGB)
 * color(A) = (sourceAlpha * srcAlpha) + (destinationAlpha * dstAlpha)
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFuncSeparate*/
export declare class BlendState {
    srcRGB: BlendFactor;
    dstRGB: BlendFactor;
    srcAlpha: BlendFactor;
    dstAlpha: BlendFactor;
}

export declare class PassState {
    shader: Shader;
    primitive: PrimitiveTopology;
    rasterizationState: RasterizationState;
    depthStencilState?: DepthStencilState;
    blendState?: BlendState;
}

export declare class VertexInputAttributeDescription {
    location: number;
    format: Format;
    binding: number;
    offset: number
}
/**
 * stride can't be zero even if vertex buffer is tightly packed. Unlike in OpenGL, the value must be explicit in Vulkan.
 */
export declare class VertexInputBindingDescription {
    binding: number;
    stride: number;
    inputRate: VertexInputRate;
}
export class VertexInputAttributeDescriptionVector extends Vector<VertexInputAttributeDescription>{ };
export class VertexInputBindingDescriptionVector extends Vector<VertexInputBindingDescription>{ };
/**
 * Vulkan separates binding from attribute, because multi attributes will use the same binding if vertex buffer is interleaved, I guess.
 */
export declare class VertexInputState {
    attributes: VertexInputAttributeDescriptionVector;
    bindings: VertexInputBindingDescriptionVector;
}

export declare class PipelineInfo {
    vertexInputState: VertexInputState;
    passState: PassState;
    layout: PipelineLayout;
    renderPass: RenderPass;
}

export declare class SubmitInfo {
    commandBuffer: CommandBuffer;
    waitSemaphore?: Semaphore;
    waitDstStageMask?: PipelineStageFlagBits;
    signalSemaphore?: Semaphore;
}
