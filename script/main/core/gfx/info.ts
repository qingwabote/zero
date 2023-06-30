import Buffer from "./Buffer.js";
import CommandBuffer from "./CommandBuffer.js";
import DescriptorSetLayout from "./DescriptorSetLayout.js";
import Format from "./Format.js";
import { PipelineLayout } from "./Pipeline.js";
import RenderPass from "./RenderPass.js";
import Semaphore from "./Semaphore.js";
import Shader from "./Shader.js";
import Texture from "./Texture.js";

export interface Vector<T> {
    size(): number;
    get(i: number): T;
    add(v: T): void;
}
export type FloatVector = Vector<number>;
export type Uint32Vector = Vector<number>;
export type StringVector = Vector<string>;

// copy values from VkBufferUsageFlagBits in vulkan_core.h
export enum BufferUsageFlagBits {
    NONE = 0,
    TRANSFER_DST = 0x00000002,
    UNIFORM = 0x00000010,
    INDEX = 0x00000040,
    VERTEX = 0x00000080,
}

// copy values from VmaMemoryUsage in vk_men_alloc.h
export enum MemoryUsage {
    NONE = 0,
    GPU_ONLY = 1,
    CPU_TO_GPU = 3,
}

export interface BufferInfo {
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

// copy values from VkShaderStageFlagBits in vulkan_core.h
export enum ShaderStageFlagBits {
    NONE = 0,
    VERTEX = 0x1,
    FRAGMENT = 0x10
}

// copy values from VkDescriptorType in vulkan_core.h
export enum DescriptorType {
    NONE = 0,
    SAMPLER_TEXTURE = 1,
    UNIFORM_BUFFER = 6,
    UNIFORM_BUFFER_DYNAMIC = 8,
}

export interface DescriptorSetLayoutBinding {
    binding: number;
    descriptorType: DescriptorType;
    descriptorCount: number;
    stageFlags: ShaderStageFlagBits;
}

export type DescriptorSetLayoutBindingVector = Vector<DescriptorSetLayoutBinding>;

export interface DescriptorSetLayoutInfo {
    bindings: DescriptorSetLayoutBindingVector;
}

// copy values from VkSampleCountFlagBits in vulkan_core.h
export enum SampleCountFlagBits {
    SAMPLE_COUNT_1 = 0x00000001,
    SAMPLE_COUNT_2 = 0x00000002,
    SAMPLE_COUNT_4 = 0x00000004,
    SAMPLE_COUNT_8 = 0x00000008,
    SAMPLE_COUNT_16 = 0x00000010,
    SAMPLE_COUNT_32 = 0x00000020,
    SAMPLE_COUNT_64 = 0x00000040,
}

// copy values from VkImageUsageFlagBits in vulkan_core.h
export enum TextureUsageBits {
    NONE = 0,
    TRANSFER_DST = 0x00000002,
    SAMPLED = 0x00000004,
    COLOR_ATTACHMENT = 0x00000010,
    DEPTH_STENCIL_ATTACHMENT = 0x00000020,
    TRANSIENT_ATTACHMENT = 0x00000040,
}

export interface TextureInfo {
    samples: SampleCountFlagBits;
    usage: TextureUsageBits;
    width: number;
    height: number;
}

export type TextureVector = Vector<Texture>;

export interface FramebufferInfo {
    colorAttachments: TextureVector;
    depthStencilAttachment: Texture;
    resolveAttachments: TextureVector;
    renderPass: RenderPass;
    width: number;
    height: number;
}

// copy values from VkAttachmentLoadOp in vulkan_core.h
export enum LOAD_OP {
    LOAD = 0,
    CLEAR = 1,
}
// copy values from VkImageLayout in vulkan_core.h
export enum ImageLayout {
    UNDEFINED = 0,
    COLOR_ATTACHMENT_OPTIMAL = 2,
    DEPTH_STENCIL_ATTACHMENT_OPTIMAL = 3,
    DEPTH_STENCIL_READ_ONLY_OPTIMAL = 4,
    PRESENT_SRC = 1000001002,
}
export interface AttachmentDescription {
    // format: Format;
    loadOp: LOAD_OP;
    initialLayout: ImageLayout;
    finalLayout: ImageLayout;
}
export type AttachmentDescriptionVector = Vector<AttachmentDescription>;
export interface RenderPassInfo {
    colorAttachments: AttachmentDescriptionVector;
    depthStencilAttachment: AttachmentDescription;
    resolveAttachments: AttachmentDescriptionVector;
    samples: SampleCountFlagBits
}

// copy values from VkFilter in vulkan_core.h
export enum Filter {
    NEAREST = 0,
    LINEAR = 1
}
// copy values from VkSamplerAddressMode in vulkan_core.h
// export enum Address {
//     REPEAT = 0,
// }
export interface SamplerInfo {
    magFilter: Filter;
    minFilter: Filter;
}

export interface ShaderInfo {
    readonly sources: StringVector;
    readonly types: Vector<ShaderStageFlagBits>;
}

export type DescriptorSetLayoutVector = Vector<DescriptorSetLayout>;
export interface PipelineLayoutInfo {
    layouts: DescriptorSetLayoutVector
}

// copy values from VkVertexInputRate in vulkan_core.h
export enum VertexInputRate {
    VERTEX = 0,
    INSTANCE = 1
}

export interface VertexInputAttributeDescription {
    location: number;
    format: Format;
    binding: number;
    offset: number
}
/**
 * stride can't be zero even if vertex buffer is tightly packed. Unlike in OpenGL, the value must be explicit in Vulkan.
 */
export interface VertexInputBindingDescription {
    binding: number;
    stride: number;
    inputRate: VertexInputRate;
}
export type VertexInputAttributeDescriptionVector = Vector<VertexInputAttributeDescription>;
export type VertexInputBindingDescriptionVector = Vector<VertexInputBindingDescription>;
/**
 * Vulkan separates binding from attribute, because multi attributes will use the same binding if vertex buffer is interleaved, I guess.
 */
export interface VertexInputState {
    attributes: VertexInputAttributeDescriptionVector,
    bindings: VertexInputBindingDescriptionVector,
}

export type BufferVector = Vector<Buffer>;
export interface VertexInput {
    buffers: BufferVector;
    offsets: FloatVector;
}
// copy values from VkIndexType in vulkan_core.h
export enum IndexType {
    UINT16 = 0,
    UINT32 = 1,
}
export interface IndexInput {
    buffer: Buffer;
    offset: number;
    type: IndexType;
}
export interface InputAssemblerInfo {
    vertexInputState: VertexInputState;
    vertexInput: VertexInput;
    indexInput?: IndexInput;
}

//copy values from VkCullModeFlagBits in vulkan_core.h
export enum CullMode {
    NONE = 0,
    FRONT = 0x00000001,
    BACK = 0x00000002,
}
export interface RasterizationState {
    cullMode: CullMode;
}
export interface DepthStencilState {
    depthTestEnable: boolean;
}
// copy values from VkBlendFactor in vulkan_core.h
export enum BlendFactor {
    ZERO = 0,
    ONE = 1,
    SRC_ALPHA = 6,
    ONE_MINUS_SRC_ALPHA = 7,
    DST_ALPHA = 8,
    ONE_MINUS_DST_ALPHA = 9,
    // SRC_COLOR,
    // DST_COLOR,
    // ONE_MINUS_SRC_COLOR,
    // ONE_MINUS_DST_COLOR,
    // SRC_ALPHA_SATURATE,
    // CONSTANT_COLOR,
    // ONE_MINUS_CONSTANT_COLOR,
    // CONSTANT_ALPHA,
    // ONE_MINUS_CONSTANT_ALPHA,
}
/**color(RGB) = (sourceColor * srcRGB) + (destinationColor * dstRGB)
 * color(A) = (sourceAlpha * srcAlpha) + (destinationAlpha * dstAlpha)
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFuncSeparate*/
export interface BlendState {
    srcRGB: BlendFactor;
    dstRGB: BlendFactor;
    srcAlpha: BlendFactor;
    dstAlpha: BlendFactor;
}
// copy values from VkPrimitiveTopology in vulkan_core.h
export enum PrimitiveTopology {
    LINE_LIST = 1,
    TRIANGLE_LIST = 3
}
export interface PassState {
    shader: Shader;
    primitive: PrimitiveTopology;
    rasterizationState: RasterizationState;
    depthStencilState?: DepthStencilState;
    blendState?: BlendState;
}

export interface PipelineInfo {
    vertexInputState: VertexInputState,
    passState: PassState;
    layout: PipelineLayout;
    renderPass: RenderPass;
}

// copy values from VkPipelineStageFlagBits in vulkan_core.h
export enum PipelineStageFlagBits {
    PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT = 0x00000400
}
export type PipelineStageFlags = PipelineStageFlagBits;

export interface SubmitInfo {
    commandBuffer: CommandBuffer;
    waitSemaphore?: Semaphore;
    waitDstStageMask?: PipelineStageFlags;
    signalSemaphore?: Semaphore;
}