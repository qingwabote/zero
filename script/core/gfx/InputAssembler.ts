import Buffer from "./Buffer.js";
import { Format } from "./Pipeline.js";

// copy values from VkVertexInputRate in vulkan_core.h
export enum VertexInputRate {
    VERTEX = 0,
    INSTANCE = 1
}

export interface VertexInputBindingDescription {
    readonly binding: number;
    readonly stride: number;
    readonly inputRate: VertexInputRate;
}

export interface VertexInputAttributeDescription {
    readonly location: number;
    readonly format: Format;
    readonly binding: number;
    readonly offset: number
}

export interface VertexInputState {
    readonly attributes: readonly VertexInputAttributeDescription[];
    readonly bindings: readonly VertexInputBindingDescription[];
    readonly hash: string;
}

export interface VertexInput {
    readonly vertexBuffers: readonly Buffer[];
    readonly vertexOffsets: readonly number[];
    readonly indexBuffer: Buffer;
    readonly indexType: IndexType;
    readonly indexCount: number;
    readonly indexOffset: number
}

// copy values from VkIndexType in vulkan_core.h
export enum IndexType {
    UINT16 = 0,
    UINT32 = 1,
}

export interface InputAssemblerInfo {
    readonly vertexInputState: VertexInputState;
    readonly vertexInput: VertexInput;
}

/**
 * InputAssembler is an immutable object, it correspond to a vao in WebGL.
 */
export default interface InputAssembler {
    get info(): InputAssemblerInfo;
    initialize(info: InputAssemblerInfo): boolean;
}