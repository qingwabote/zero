import Buffer from "./Buffer.js";
import Shader from "./Shader.js";

export const blocksGlobal = {
    set: 0,
    blocks: {
        Camera: {
            binding: 0,
            uniforms: [
                { name: "matProj" }
            ]
        }
    }
}

export const blocksLocal = {
    set: 1,
    blocks: {
        Local: {
            binding: 0,
            uniforms: [
                { name: "matWorld" }
            ]
        }
    }
}

export enum DescriptorType {
    UNIFORM_BUFFER = 0x1
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
}

export interface PipelineLayout {
    readonly setLayouts: DescriptorSetLayout[];
}

function buildDescriptorSetLayout(res: {
    set: number,
    blocks: Record<string, { binding: number, uniforms: { name: string }[] }>
}): DescriptorSetLayout {
    const bindings: DescriptorSetLayoutBinding[] = [];
    for (const name in res.blocks) {
        const block = res.blocks[name];
        bindings[block.binding] = { binding: block.binding, descriptorType: DescriptorType.UNIFORM_BUFFER, count: 1 }
    }
    return { bindings }
}

export const globalDescriptorSetLayout: DescriptorSetLayout = buildDescriptorSetLayout(blocksGlobal);
export const localDescriptorSetLayout: DescriptorSetLayout = buildDescriptorSetLayout(blocksLocal);


// export const pipelineLayout: PipelineLayout = {
//     setLayouts: [
//         globalDescriptorSetLayout,
//         localDescriptorSetLayout
//     ]
// }

export default interface Pipeline {
    readonly shader: Shader;
    // readonly layout: PipelineLayout;
}