import { Format, IndexType } from "gfx-main";
import { Vec3 } from "../math/vec3.js";
import { BufferView } from "./buffers/BufferView.js";

export const PIXELS_PER_UNIT = 100;

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

export interface SubMesh {
    readonly vertexAttributes: readonly VertexAttribute[],

    readonly vertexInput: VertexInputView;

    readonly vertexPositionMin: Vec3,
    readonly vertexPositionMax: Vec3,

    readonly indexInput?: IndexInputView;

    vertexOrIndexCount: number
}