import Buffer from "./Buffer.js";
import Format from "./Format.js";

// copy values from VkVertexInputRate in vulkan_core.h
export enum VertexInputRate {
    VERTEX = 0,
    INSTANCE = 1
}

/**
 * stride can't be zero even if vertex buffer is tightly packed. Unlike in OpenGL, the value must be explicit in Vulkan.
 */
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

/**
 * Vulkan separates binding from attribute, because multi attributes will use the same binding if vertex buffer is interleaved, I guess.
 */
export class VertexInputState {
    readonly attributes: readonly VertexInputAttributeDescription[];
    readonly bindings: readonly VertexInputBindingDescription[];
    readonly hash: string;

    constructor(attributes: readonly VertexInputAttributeDescription[], bindings: readonly VertexInputBindingDescription[]) {
        let hash = '';
        for (const attribute of attributes) {
            hash += attribute.location + attribute.format + attribute.binding + attribute.offset;
        }
        this.hash = hash;
        this.attributes = attributes;
        this.bindings = bindings;
    }
}

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