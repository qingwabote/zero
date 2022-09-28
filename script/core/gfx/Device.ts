import Buffer from "./Buffer.js";
import CommandBuffer from "./CommandBuffer.js";
import Pipeline, { DescriptorSet, DescriptorSetLayout, PipelineLayout } from "./Pipeline.js";
import Shader from "./Shader.js";
import Texture, { TextureInfo } from "./Texture.js";

export interface Capabilities {
    readonly uniformBufferOffsetAlignment: number
}

export default interface Device {
    get capabilities(): Capabilities;

    get commandBuffer(): CommandBuffer;

    initialize(): boolean;

    createDescriptorSetLayout(): DescriptorSetLayout;

    createDescriptorSet(): DescriptorSet;

    createPipelineLayout(): PipelineLayout;

    createPipeline(): Pipeline;

    createShader(): Shader;

    createBuffer(): Buffer;

    createTexture(info: TextureInfo): Texture;

    present(): void;
}