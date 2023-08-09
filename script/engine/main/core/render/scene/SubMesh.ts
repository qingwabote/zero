import { IndexType, VertexAttributeVector } from "gfx-main";
import { Vec3 } from "../../math/vec3.js";
import { BufferView } from "./buffers/BufferView.js";

export const PIXELS_PER_UNIT = 100;

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
    readonly vertexAttributes: VertexAttributeVector,

    readonly vertexInput: VertexInputView;

    readonly vertexPositionMin: Vec3,
    readonly vertexPositionMax: Vec3,

    readonly indexInput?: IndexInputView;

    vertexOrIndexCount: number
}