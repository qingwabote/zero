import DescriptorSetLayout from "./DescriptorSetLayout.js";
import { VertexInputState } from "./InputAssembler.js";
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

export enum ClearFlagBit {
    NONE = 0,
    COLOR = 0x1,
    DEPTH = 0x2
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

export interface BlendState {
    enabled: boolean;
    srcRGB: BlendFactor;
    dstRGB: BlendFactor;
    srcAlpha: BlendFactor;
    dstAlpha: BlendFactor;
}

export class PassState {
    readonly hash: string;

    constructor(
        readonly shader: Shader,
        readonly primitive: PrimitiveTopology = PrimitiveTopology.TRIANGLE_LIST,
        readonly rasterizationState: RasterizationState = { cullMode: CullMode.BACK },
        readonly depthStencilState: DepthStencilState = { depthTestEnable: true },
        readonly blendState: BlendState = { enabled: true, srcRGB: BlendFactor.SRC_ALPHA, dstRGB: BlendFactor.ONE_MINUS_SRC_ALPHA, srcAlpha: BlendFactor.ONE, dstAlpha: BlendFactor.ONE_MINUS_SRC_ALPHA },
    ) {
        let hash = shader.info.hash;
        hash += `${rasterizationState.cullMode}`;
        hash += `${depthStencilState.depthTestEnable}`;
        hash += `${blendState.enabled}${blendState.srcRGB}${blendState.dstRGB}${blendState.srcAlpha}${blendState.dstAlpha}`;
        hash += `${primitive}`;
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