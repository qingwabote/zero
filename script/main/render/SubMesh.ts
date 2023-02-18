import Buffer from "../gfx/Buffer.js";
import { IndexType } from "../gfx/InputAssembler.js";
import { Format } from "../gfx/Pipeline.js";
import { Vec3 } from "../math/vec3.js";

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
        readonly vertexPositionMin: Vec3,
        readonly vertexPositionMax: Vec3,

        readonly indexBuffer: Buffer,
        readonly indexType: IndexType,
        readonly indexCount: number,
        readonly indexOffset: number) {
    }
} 