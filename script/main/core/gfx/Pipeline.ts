import DescriptorSetLayout from "./DescriptorSetLayout.js";
import Format from "./Format.js";
import RenderPass from "./RenderPass.js";
import Shader from "./Shader.js";

// copy values from VkPipelineStageFlagBits in vulkan_core.h
export enum PipelineStageFlagBits {
    PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT = 0x00000400
}
export type PipelineStageFlags = PipelineStageFlagBits;

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

export interface PipelineLayout {
    initialize(setLayouts: DescriptorSetLayout[]): boolean;
}

export enum ClearFlagBits {
    NONE = 0,
    COLOR = 0x1,
    DEPTH = 0x2
}

// copy values from VkVertexInputRate in vulkan_core.h
export enum VertexInputRate {
    VERTEX = 0,
    INSTANCE = 1
}

/**
 * stride can't be zero even if vertex buffer is tightly packed. Unlike in OpenGL, the value must be explicit in Vulkan.
 */
export interface VertexInputBindingDescription {
    readonly binding: number;
    readonly stride: number;
    readonly inputRate: VertexInputRate;
}

export interface VertexInputAttributeDescription {
    readonly location: number;
    readonly format: Format;
    readonly binding: number;
    readonly offset: number
}

/**
 * Vulkan separates binding from attribute, because multi attributes will use the same binding if vertex buffer is interleaved, I guess.
 */
export class VertexInputState {
    readonly hash: string;

    constructor(readonly attributes: readonly VertexInputAttributeDescription[], readonly bindings: readonly VertexInputBindingDescription[]) {
        let hash = '';
        for (const attribute of attributes) {
            hash += attribute.location + attribute.format + attribute.binding + attribute.offset;
        }
        this.hash = hash;
        this.attributes = attributes;
        this.bindings = bindings;
    }
}

export enum PrimitiveTopology {
    LINE_LIST = 1,
    TRIANGLE_LIST = 3
}

// copy values from VkCullModeFlagBits in vulkan_core.h
export enum CullMode {
    NONE = 0,
    FRONT = 0x00000001,
    BACK = 0x00000002,
}

export interface RasterizationState {
    readonly cullMode: CullMode;
}

export interface DepthStencilState {
    readonly depthTestEnable: boolean;
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

export interface BlendState {
    readonly srcRGB: BlendFactor;
    readonly dstRGB: BlendFactor;
    readonly srcAlpha: BlendFactor;
    readonly dstAlpha: BlendFactor;
}

export interface PassStateInfo {
    readonly shader: Shader;
    readonly primitive?: PrimitiveTopology;
    readonly rasterizationState?: RasterizationState;
    readonly depthStencilState?: DepthStencilState;
    readonly blendState?: BlendState;
}

export class PassState {
    readonly shader: Shader;
    readonly primitive: PrimitiveTopology;
    readonly rasterizationState: RasterizationState;
    readonly depthStencilState: DepthStencilState;
    readonly blendState?: BlendState;

    readonly hash: string;

    constructor(info: PassStateInfo) {
        this.shader = info.shader;
        this.primitive = info.primitive != undefined ? info.primitive : PrimitiveTopology.TRIANGLE_LIST;
        this.rasterizationState = info.rasterizationState || { cullMode: CullMode.BACK };
        this.depthStencilState = info.depthStencilState || { depthTestEnable: true };
        this.blendState = info.blendState;

        let hash = this.shader.info.hash;
        hash += `${this.primitive}`;
        hash += `${this.rasterizationState.cullMode}`;
        hash += `${this.depthStencilState.depthTestEnable}`;
        if (this.blendState) {
            hash += `${this.blendState.srcRGB}${this.blendState.dstRGB}${this.blendState.srcAlpha}${this.blendState.dstAlpha}`;
        }
        this.hash = hash;
    }
}

export interface PipelineInfo {
    readonly vertexInputState: VertexInputState,
    readonly passState: PassState;
    readonly layout: PipelineLayout;
    readonly renderPass: RenderPass;
}

export default interface Pipeline {
    initialize(info: PipelineInfo): boolean;
}