import Buffer from "./Buffer.js";
import RenderPass from "./RenderPass.js";
import Shader, { ShaderStageFlagBits } from "./Shader.js";
import Texture from "./Texture.js";

// copy values from VkPipelineStageFlagBits in vulkan_core.h
export enum PipelineStageFlagBits {
    PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT = 0x00000400
}
export type PipelineStageFlags = PipelineStageFlagBits;

// copy values from VkFormat in vulkan_core.h
export enum Format {
    R8UI = 13,
    R16UI = 74,
    R32UI = 98,
    RG32F = 103,
    RGB32F = 106,
    RGBA32F = 109
}

interface FormatInfo {
    readonly name: string;
    readonly size: number
    readonly count: number;
}

export const FormatInfos: Readonly<Record<Format, FormatInfo>> = {
    [Format.R8UI]: { name: "R8UI", size: 1, count: 1 },
    [Format.R16UI]: { name: "R16UI", size: 2, count: 1 },
    [Format.R32UI]: { name: "R32UI", size: 4, count: 1 },
    [Format.RG32F]: { name: "RG32F", size: 8, count: 2 },
    [Format.RGB32F]: { name: "RGB32F", size: 12, count: 3 },
    [Format.RGBA32F]: { name: "RGBA32F", size: 16, count: 4 },
}

// copy values from VkVertexInputRate in vulkan_core.h
export enum VertexInputRate {
    VERTEX = 0,
    INSTANCE = 1
}

export interface VertexInputBindingDescription {
    readonly binding: number;
    readonly stride: number;
    readonly inputRate: VertexInputRate;
}

export interface VertexInputAttributeDescription {
    readonly location: number;
    readonly binding: number;
    readonly format: Format;
    readonly offset: number
}

export interface VertexInputState {
    readonly attributes: VertexInputAttributeDescription[];
    readonly bindings: VertexInputBindingDescription[];
    readonly hash: string;
}

// copy values from VkIndexType in vulkan_core.h
export enum IndexType {
    UINT16 = 0,
    UINT32 = 1,
}

/**
 * InputAssembler is an immutable object, it correspond to a vao in WebGL.
 */
export interface InputAssembler {
    vertexInputState: VertexInputState;
    vertexBuffers: Buffer[];
    vertexOffsets: number[];
    indexBuffer: Buffer;
    indexType: IndexType;
    indexCount: number;
    indexOffset: number
}

// copy values from VkDescriptorType in vulkan_core.h
export enum DescriptorType {
    SAMPLER_TEXTURE = 1,
    UNIFORM_BUFFER = 6,
    UNIFORM_BUFFER_DYNAMIC = 8,
}

export interface DescriptorSetLayoutBinding {
    readonly binding: number;
    readonly descriptorType: DescriptorType;
    readonly descriptorCount: number;
    readonly stageFlags: ShaderStageFlagBits;
}

export interface DescriptorSetLayout {
    initialize(bindings: DescriptorSetLayoutBinding[]): boolean;
}

export interface DescriptorSet {
    initialize(layout: DescriptorSetLayout): boolean;
    bindBuffer(binding: number, buffer: Buffer, range?: number): void;
    bindTexture(binding: number, texture: Texture): void;
}


export interface PipelineLayout {
    initialize(setLayouts: DescriptorSetLayout[]): boolean;
}

export enum ClearFlagBit {
    NONE = 0,
    COLOR = 0x1,
    DEPTH = 0x2
}

export interface DepthStencilState {
    depthTest: boolean;
}

export enum BlendFactor {
    ZERO,
    ONE,
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
}

export interface Blend {
    blend: boolean;
    srcRGB: BlendFactor;
    dstRGB: BlendFactor;
    srcAlpha: BlendFactor;
    dstAlpha: BlendFactor;
}

export interface BlendState {
    blends: Blend[];
}

export interface PipelineInfo {
    readonly shader: Shader;
    readonly vertexInputState: VertexInputState;
    readonly layout: PipelineLayout;
    readonly renderPass: RenderPass;
}

export default interface Pipeline {
    initialize(info: PipelineInfo): boolean;
}