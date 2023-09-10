import { IndexType, InputAssembler, VertexAttributeVector } from "gfx-main";
import { device, gfx } from "../../impl.js";
import { Vec3 } from "../../math/vec3.js";
import { BufferView } from "./buffers/BufferView.js";

export interface VertexInputView {
    readonly buffers: readonly BufferView[];
    readonly offsets: readonly number[];
}

export interface IndexInputView {
    readonly buffer: BufferView;
    readonly type: IndexType;
}

export interface DrawInfo {
    count: number;
    first: number;
}

export class SubMesh {
    readonly inputAssembler: InputAssembler;

    constructor(
        readonly vertexAttributes: VertexAttributeVector,

        readonly vertexInput: VertexInputView,

        readonly vertexPositionMin: Vec3,
        readonly vertexPositionMax: Vec3,

        readonly indexInput?: IndexInputView,

        readonly drawInfo: DrawInfo = { count: 0, first: 0 }
    ) {
        const vi = new gfx.VertexInput;
        for (const view of vertexInput.buffers) {
            vi.buffers.add(view.buffer);
        }
        for (const offset of vertexInput.offsets) {
            vi.offsets.add(offset);
        }
        const inputAssemblerInfo = new gfx.InputAssemblerInfo;
        if (indexInput) {
            const ii = new gfx.IndexInput
            ii.buffer = indexInput.buffer.buffer;
            ii.type = indexInput.type;
            inputAssemblerInfo.indexInput = ii;
        }
        inputAssemblerInfo.vertexAttributes = vertexAttributes;
        inputAssemblerInfo.vertexInput = vi;
        const inputAssembler = device.createInputAssembler();
        inputAssembler.initialize(inputAssemblerInfo);
        this.inputAssembler = inputAssembler;
    }
}