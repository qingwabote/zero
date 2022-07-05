import Buffer, { BufferInfo } from "./Buffer.js";
import CommandBuffer from "./CommandBuffer.js";
import Shader, { ShaderInfo } from "./Shader.js";

export default interface Device {
    get commandBuffer(): CommandBuffer;

    createShader(info: ShaderInfo): Shader;

    createBuffer(info: BufferInfo): Buffer;
}