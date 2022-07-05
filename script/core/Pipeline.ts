import Buffer from "./Buffer.js";
import Shader, { ShaderStageFlags } from "./Shader.js";

export enum DescriptorType {
    UNIFORM_BUFFER = 0x1
}

export interface DescriptorSetLayoutBinding {
    readonly binding: number;
    readonly descriptorType: DescriptorType;
    readonly count: number;
    readonly stageFlags: ShaderStageFlags;
}

export interface DescriptorSetLayout {
    readonly bindings: DescriptorSetLayoutBinding[]
}

export interface DescriptorSet {
    readonly layout: DescriptorSetLayout;
    readonly buffers: Buffer[];
}

// export interface PipelineLayout {
//     readonly setLayouts: DescriptorSetLayout[];
// }

export enum PipelineGlobalBindings {
    UBO_CAMERA
}

export const globalDescriptorSetLayout: DescriptorSetLayout = {
    bindings: [
        { binding: PipelineGlobalBindings.UBO_CAMERA, descriptorType: DescriptorType.UNIFORM_BUFFER, count: 1, stageFlags: ShaderStageFlags.ALL }
    ]
}

export default interface Pipeline {
    readonly shader: Shader;
    // readonly layout: PipelineLayout;
}