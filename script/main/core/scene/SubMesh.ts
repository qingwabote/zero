import Format from "../gfx/Format.js";
import { IndexType } from "../gfx/InputAssembler.js";
import { Vec3Like } from "../math/vec3.js";
import BufferView from "./buffers/BufferView.js";

export interface VertexAttribute {
    readonly name: string
    readonly format: Format
    readonly buffer: number
    readonly offset: number
}

export interface VertexInputView {
    readonly buffers: readonly BufferView[];
    readonly offsets: readonly number[];
}

export interface IndexInputView {
    readonly buffer: BufferView;
    readonly offset: number;
    readonly type: IndexType;
}

export default interface SubMesh {
    readonly vertexAttributes: readonly VertexAttribute[],

    readonly vertexInput: VertexInputView;

    readonly vertexPositionMin: Vec3Like,
    readonly vertexPositionMax: Vec3Like,

    readonly indexInput?: IndexInputView;

    vertexOrIndexCount: number
}