import Buffer from "./Buffer.js";
import { VertexInputState } from "./Pipeline.js";

export interface VertexInput {
    readonly vertexBuffers: readonly Buffer[];
    readonly vertexOffsets: readonly number[];
}

export interface IndexInput {
    readonly indexBuffer: Buffer;
    readonly indexOffset: number;
    readonly indexType: IndexType;
}

// copy values from VkIndexType in vulkan_core.h
export enum IndexType {
    UINT16 = 0,
    UINT32 = 1,
}

export interface InputAssemblerInfo {
    readonly vertexInputState: VertexInputState;
    readonly vertexInput: VertexInput;
    readonly indexInput?: IndexInput;
}

/**
 * InputAssembler is an immutable object, it correspond to a vao in WebGL.
 */
export default interface InputAssembler {
    get info(): InputAssemblerInfo;
    initialize(info: InputAssemblerInfo): boolean;
}