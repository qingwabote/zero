import Buffer from "../gfx/Buffer.js";
import { IndexType } from "../gfx/InputAssembler.js";
import { Format } from "../gfx/Pipeline.js";

export interface VertexAttribute {
    readonly name: string
    readonly format: Format
    readonly buffer: number
    readonly offset: number
}

export default class SubMesh {
    constructor(
        readonly vertexAttributes: VertexAttribute[],
        readonly vertexBuffers: Buffer[],
        readonly vertexOffsets: number[],
        readonly indexBuffer: Buffer,
        readonly indexType: IndexType,
        readonly indexCount: number,
        readonly indexOffset: number) {
    }
} 