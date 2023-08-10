import { IndexInput, InputAssembler, impl } from "gfx-main";
import { device } from "../../impl.js";
import { Pass } from "./Pass.js";
import { DrawInfo, SubMesh } from "./SubMesh.js";
import { BufferViewResizable, BufferViewResizableEventType } from "./buffers/BufferViewResizable.js";

export class SubModel {
    private _inputAssemblerInvalidated = true;

    private _inputAssembler?: InputAssembler;
    public get inputAssembler(): InputAssembler {
        this.updateInputAssembler();
        return this._inputAssembler!;
    }

    public get drawInfo(): DrawInfo {
        return this._subMesh.drawInfo;
    }

    constructor(private _subMesh: SubMesh, public readonly passes: Pass[]) {
        for (const view of _subMesh.vertexInput.buffers) {
            if (view instanceof BufferViewResizable) {
                view.on(BufferViewResizableEventType.REALLOCATED, () => this._inputAssemblerInvalidated = true)
            }
        }
    }

    update() {
        for (const pass of this.passes) {
            pass.update();
        }
    }

    private updateInputAssembler() {
        if (!this._inputAssemblerInvalidated) return;

        const vertexInput = new impl.VertexInput;
        for (const view of this._subMesh.vertexInput.buffers) {
            vertexInput.buffers.add(view.buffer);
        }
        for (const offset of this._subMesh.vertexInput.offsets) {
            vertexInput.offsets.add(offset);
        }
        let indexInput: IndexInput | undefined;
        if (this._subMesh.indexInput) {
            indexInput = new impl.IndexInput
            indexInput.buffer = this._subMesh.indexInput.buffer.buffer;
            indexInput.type = this._subMesh.indexInput.type;
        }
        const inputAssemblerInfo = new impl.InputAssemblerInfo;
        inputAssemblerInfo.vertexAttributes = this._subMesh.vertexAttributes;
        inputAssemblerInfo.vertexInput = vertexInput;
        if (indexInput) inputAssemblerInfo.indexInput = indexInput;
        const inputAssembler = device.createInputAssembler();
        inputAssembler.initialize(inputAssemblerInfo);
        this._inputAssembler = inputAssembler;

        this._inputAssemblerInvalidated = false;
    }
}