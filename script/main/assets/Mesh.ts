import Buffer from "../core/gfx/Buffer.js";
import Format from "../core/gfx/Format.js";
import { IndexType } from "../core/gfx/InputAssembler.js";
import { Vec3Like } from "../core/math/vec3.js";

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
    readonly vertexPositionMin: Vec3Like,
    readonly vertexPositionMax: Vec3Like,

    readonly indexBuffer: Buffer,
    readonly indexType: IndexType,
    readonly indexCount: number,
    readonly indexOffset: number
}

export default interface Mesh {
    readonly subMeshes: readonly SubMesh[];
}