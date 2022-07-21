import { Format } from "../gfx.js";
import Buffer from "./Buffer.js";

export interface VertexInputAttributeDescription {
    readonly location: number;
    readonly binding: number;
    readonly format: Format;
    readonly offset: number
}

export interface InputAssembler {
    attributes: VertexInputAttributeDescription[];
    vertexBuffers: Buffer[];
    indexBuffer: Buffer;
    indexType: Format;
    indexCount: number;
    indexOffset: number
}