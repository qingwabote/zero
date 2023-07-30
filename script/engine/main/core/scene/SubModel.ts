import { FormatInfos, IndexInput, InputAssembler, VertexInputRate, VertexInputState, impl } from "gfx-main";
import { device } from "../impl.js";
import { shaderLib } from "../shaderLib.js";
import { Pass } from "./Pass.js";
import { SubMesh } from "./SubMesh.js";
import { BufferViewResizable, BufferViewResizableEventType } from "./buffers/BufferViewResizable.js";

export class SubModel {
    private readonly _vertexInputStates: VertexInputState[];

    private _inputAssemblerInvalidated = true;

    private _inputAssemblers: InputAssembler[] = [];
    public get inputAssemblers(): readonly InputAssembler[] {
        return this._inputAssemblers;
    }

    public get vertexOrIndexCount(): number {
        return this._subMesh.vertexOrIndexCount;
    }

    constructor(private _subMesh: SubMesh, public readonly passes: Pass[]) {
        const bindings = new impl.VertexInputBindingDescriptionVector
        for (let binding = 0; binding < _subMesh.vertexInput.buffers.length; binding++) {
            const view = _subMesh.vertexInput.buffers[binding];
            let stride = view.buffer.info.stride;
            if (!stride) {
                stride = _subMesh.vertexAttributes.reduce((count, attribute) => count + (attribute.buffer == binding ? FormatInfos[attribute.format].size : 0), 0);
            }
            const description = new impl.VertexInputBindingDescription;
            description.binding = binding;
            description.stride = stride;
            description.inputRate = VertexInputRate.VERTEX;
            bindings.add(description);
            if (view instanceof BufferViewResizable) {
                view.on(BufferViewResizableEventType.REALLOCATED, () => this._inputAssemblerInvalidated = true)
            }
        }
        const vertexInputStates: VertexInputState[] = [];
        for (let j = 0; j < passes.length; j++) {
            const pass = passes[j];
            const vertexInputState = new impl.VertexInputState;
            for (const attribute of _subMesh.vertexAttributes) {
                const definition = shaderLib.getMeta(pass.state.shader).attributes[attribute.name];
                if (!definition) {
                    continue;
                }

                const description = new impl.VertexInputAttributeDescription;
                description.location = definition.location;
                // attribute.format in buffer can be different from definition.format in shader, 
                // use attribute.format here to make sure type conversion can be done correctly by graphics api.
                // https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/vertexAttribPointer#integer_attributes
                description.format = attribute.format;
                description.binding = attribute.buffer;
                description.offset = attribute.offset;
                vertexInputState.attributes.add(description);
            }
            vertexInputState.bindings = bindings;
            // the same attributes always come with same bindings for now, so we calculate only the hash of attributes
            vertexInputStates.push(vertexInputState);
        }
        this._vertexInputStates = vertexInputStates;
    }

    update() {
        if (this._inputAssemblerInvalidated) {
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
                indexInput.offset = this._subMesh.indexInput.offset;
                indexInput.type = this._subMesh.indexInput.type;
            }
            for (let i = 0; i < this.passes.length; i++) {
                const inputAssemblerInfo = new impl.InputAssemblerInfo;
                inputAssemblerInfo.vertexInputState = this._vertexInputStates[i];
                inputAssemblerInfo.vertexInput = vertexInput;
                if (indexInput) inputAssemblerInfo.indexInput = indexInput;
                const inputAssembler = device.createInputAssembler();
                inputAssembler.initialize(inputAssemblerInfo);
                this._inputAssemblers[i] = inputAssembler;
            }
            this._inputAssemblerInvalidated = false;
        }
        for (const pass of this.passes) {
            pass.update();
        }
    }
}