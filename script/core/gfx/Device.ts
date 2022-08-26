import Buffer, { BufferInfo } from "./Buffer.js";
import CommandBuffer from "./CommandBuffer.js";
import Pipeline from "./Pipeline.js";
import Shader, { ShaderInfo } from "./Shader.js";
import Texture, { TextureInfo } from "./Texture.js";

export default interface Device {
    get commandBuffer(): CommandBuffer;

    initialize(): boolean;

    createPipeline(): Pipeline;

    createShader(info: ShaderInfo): Shader;

    createBuffer(info: BufferInfo): Buffer;

    createTexture(info: TextureInfo): Texture;

    createImageBitmap(blob: Blob): Promise<ImageBitmap>;

    submit(commandBuffer: CommandBuffer): void;
}