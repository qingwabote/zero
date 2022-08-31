import Buffer from "./Buffer.js";
import Shader from "./Shader.js";
import Texture from "./Texture.js";

export enum DescriptorType {
    UNIFORM_BUFFER = 0x1,
    SAMPLER_TEXTURE = 0x10,
}

export interface DescriptorSetLayoutBinding {
    readonly binding: number;
    readonly descriptorType: DescriptorType;
    readonly count: number;
    // readonly stageFlags: ShaderStageFlags;
}

export interface DescriptorSetLayout {
    readonly bindings: DescriptorSetLayoutBinding[]
}

export interface DescriptorSet {
    readonly layout: DescriptorSetLayout;
    readonly buffers: Buffer[];
    readonly textures: Texture[];
}

export interface PipelineLayout {
    readonly setLayouts: DescriptorSetLayout[];
}


// export const pipelineLayout: PipelineLayout = {
//     setLayouts: [
//         globalDescriptorSetLayout,
//         localDescriptorSetLayout
//     ]
// }

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
    readonly depthStencilState: Readonly<DepthStencilState>;
    readonly blendState: Readonly<BlendState>;
    // readonly layout: PipelineLayout;
}

export default interface Pipeline {
    initialize(info: PipelineInfo): boolean;
}