import Buffer from "./Buffer.js";
import { VertexInputState } from "./Pipeline.js";

// copy values from VkIndexType in vulkan_core.h
export enum IndexType {
    UINT16 = 0,
    UINT32 = 1,
}

export interface VertexInput {
    readonly buffers: readonly Buffer[];
    readonly offsets: readonly number[];
}

export interface IndexInput {
    readonly buffer: Buffer;
    readonly offset: number;
    readonly type: IndexType;
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