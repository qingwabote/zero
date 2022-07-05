import Buffer from "./Buffer.js";
import { Format } from "./gfx.js";

export interface VertexInputAttributeDescription {
    readonly location: number;
    readonly binding: number;
    readonly format: Format;
}

export interface InputAssembler {
    readonly attributes: VertexInputAttributeDescription[];
    readonly vertexBuffers: Buffer[];
    readonly indexBuffer: Buffer;
}