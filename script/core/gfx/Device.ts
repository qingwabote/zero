import Buffer from "./Buffer.js";
import CommandBuffer from "./CommandBuffer.js";
import Pipeline, { DescriptorSet, DescriptorSetLayout } from "./Pipeline.js";
import Shader from "./Shader.js";
import Texture, { TextureInfo } from "./Texture.js";

export default interface Device {
    get commandBuffer(): CommandBuffer;

    initialize(): boolean;

    createDescriptorSetLayout(): DescriptorSetLayout;

    createDescriptorSet(): DescriptorSet;

    createPipeline(): Pipeline;

    createShader(): Shader;

    createBuffer(): Buffer;

    createTexture(info: TextureInfo): Texture;

    createImageBitmap(blob: Blob): Promise<ImageBitmap>;

    present(): void;
}