import Buffer from "../core/gfx/Buffer.js";
import { IndexType } from "../core/gfx/InputAssembler.js";
import { Format } from "../core/gfx/Pipeline.js";
import { Vec3 } from "../core/math/vec3.js";

export interface VertexAttribute {
    readonly name: string
    readonly format: Format
    readonly buffer: number
    readonly offset: number
}

export interface SubMesh {
    readonly vertexAttributes: VertexAttribute[],
    readonly vertexBuffers: Buffer[],
    readonly vertexOffsets: number[],
    readonly vertexPositionMin: Vec3,
    readonly vertexPositionMax: Vec3,

    readonly indexBuffer: Buffer,
    readonly indexType: IndexType,
    readonly indexCount: number,
    readonly indexOffset: number
}

export default interface Mesh {
    readonly subMeshes: readonly SubMesh[];
}