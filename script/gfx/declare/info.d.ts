import { BlendFactor, BufferUsageFlagBits, CullMode, DescriptorType, Filter, Format, ImageLayout, IndexType, LOAD_OP, MemoryUsage, PipelineStageFlagBits, PrimitiveTopology, SampleCountFlagBits, ShaderStageFlagBits, TextureUsageFlagBits } from "gfx-common";
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

export declare class FloatVector extends Vector<number> { }
export declare class Uint32Vector extends Vector<number> { };
export declare class StringVector extends Vector<string> { };

export declare class BufferInfo {
    usage: BufferUsageFlagBits;
    mem_usage: MemoryUsage;
    size: number;
}

export declare class DescriptorSetLayoutBinding {
    binding: number;
    descriptorType: DescriptorType;
    descriptorCount: number;
    stageFlags: ShaderStageFlagBits;
}

export class DescriptorSetLayoutBindingVector extends Vector<DescriptorSetLayoutBinding> { };

export declare class DescriptorSetLayoutInfo {
    bindings: DescriptorSetLayoutBindingVector;
}

export declare class TextureInfo {
    samples: SampleCountFlagBits;
    usage: TextureUsageFlagBits;
    width: number;
    height: number;
}

export class TextureVector extends Vector<Texture> { };

export declare class FramebufferInfo {
    colors: TextureVector;
    depthStencil: Texture | null;
    resolves: TextureVector;
    renderPass: RenderPass | null;
    width: number;
    height: number;
}

export declare class AttachmentDescription {
    // format: Format;
    loadOp: LOAD_OP;
    initialLayout: ImageLayout;
    finalLayout: ImageLayout;
}
export class AttachmentDescriptionVector extends Vector<AttachmentDescription> { };
export declare class RenderPassInfo {
    colors: AttachmentDescriptionVector;
    depthStencil: AttachmentDescription;
    resolves: AttachmentDescriptionVector;
    samples: SampleCountFlagBits
}

export declare class SamplerInfo {
    magFilter: Filter;
    minFilter: Filter;
}

export declare class ShaderInfo {
    sources: StringVector;
    types: Vector<ShaderStageFlagBits>;
}

export class DescriptorSetLayoutVector extends Vector<DescriptorSetLayout> { };
export declare class PipelineLayoutInfo {
    layouts: DescriptorSetLayoutVector
}

export declare class VertexAttribute {
    location: number
    format: Format
    /**
     * The buffer index in vertexInput.
     * Webgl does not support indirect binding, so we use the buffer index as binding point in vulkan for consistency.
     */
    buffer: number
    offset: number
    /**
     * When byteStride of the referenced bufferView is not defined, 
     * it means that accessor elements are tightly packed, 
     * i.e., effective stride equals the size of the element.
     * https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#data-alignment
     */
    stride: number
    instanced: boolean
    multiple: number
}
export class VertexAttributeVector extends Vector<VertexAttribute> { };

export declare class VertexInputState {
    attributes: VertexAttributeVector;
    primitive: PrimitiveTopology;
}

export class BufferVector extends Vector<Buffer> { };
export declare class VertexInput {
    buffers: BufferVector;
    offsets: Uint32Vector;
}

export declare class IndexInput {
    buffer: Buffer | null;
    // offset: number; // WebGL can not specify the offset of the index buffer at buffer binding
    type: IndexType;
}
/** InputAssembler is an immutable object, it correspond to a vao in WebGL. */
export declare class InputAssembler {
    vertexInputState: VertexInputState;
    vertexInput: VertexInput;
    indexInput: IndexInput | null;
}

export declare class RasterizationState {
    cullMode: CullMode;
}
export declare class DepthStencilState {
    depthTestEnable: boolean;
}

/**RGB = (srcRGBValue * srcRGB) + (dstRGBValue * dstRGB)
 * A = (srcAlphaValue * srcAlpha) + (dstAlphaValue * dstAlpha)
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFuncSeparate */
export declare class BlendState {
    srcRGB: BlendFactor;
    dstRGB: BlendFactor;
    srcAlpha: BlendFactor;
    dstAlpha: BlendFactor;
}

export declare class PassState {
    shader: Shader | null;
    rasterizationState: RasterizationState;
    depthStencilState: DepthStencilState | null;
    blendState: BlendState | null;
}

export declare class PipelineInfo {
    inputState: VertexInputState | null;
    passState: PassState | null;
    layout: PipelineLayout | null;
    renderPass: RenderPass | null;
}

export declare class SubmitInfo {
    commandBuffer: CommandBuffer | null;
    waitSemaphore: Semaphore | null;
    waitDstStageMask: PipelineStageFlagBits;
    signalSemaphore: Semaphore | null;
}

