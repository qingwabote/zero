import { FormatInfos } from "../gfx/Format.js";
import InputAssembler, { IndexInput, VertexInput } from "../gfx/InputAssembler.js";
import { VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "../gfx/Pipeline.js";
import shaderLib from "../shaderLib.js";
import Pass from "./Pass.js";
import SubMesh from "./SubMesh.js";
import BufferViewResizable, { BufferViewResizableEventType } from "./buffers/BufferViewResizable.js";

export default class SubModel {
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
        const bindings: VertexInputBindingDescription[] = [];
        for (let binding = 0; binding < _subMesh.vertexInput.buffers.length; binding++) {
            const view = _subMesh.vertexInput.buffers[binding];
            let stride = view.buffer.info.stride;
            if (!stride) {
                stride = _subMesh.vertexAttributes.reduce((count, attribute) => count + (attribute.buffer == binding ? FormatInfos[attribute.format].size : 0), 0);
            }
            bindings.push({
                binding,
                stride,
                inputRate: VertexInputRate.VERTEX
            })
            if (view instanceof BufferViewResizable) {
                view.on(BufferViewResizableEventType.REALLOCATED, () => this._inputAssemblerInvalidated = true)
            }
        }
        const vertexInputStates: VertexInputState[] = [];
        for (let j = 0; j < passes.length; j++) {
            const pass = passes[j];
            const attributes: VertexInputAttributeDescription[] = [];
            for (const attribute of _subMesh.vertexAttributes) {
                const definition = shaderLib.getMeta(pass.state.shader).attributes[attribute.name];
                if (!definition) {
                    continue;
                }

                attributes.push({
                    location: definition.location,
                    // attribute.format in buffer can be different from definition.format in shader, 
                    // use attribute.format here to make sure type conversion can be done correctly by graphics api.
                    // https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/vertexAttribPointer#integer_attributes
                    format: attribute.format,
                    binding: attribute.buffer,
                    offset: attribute.offset
                });
            }
            // the same attributes always come with same bindings for now, so we calculate only the hash of attributes
            vertexInputStates.push(new VertexInputState(attributes, bindings));
        }
        this._vertexInputStates = vertexInputStates;
    }

    update() {
        if (this._inputAssemblerInvalidated) {
            const vertexInput: VertexInput = {
                buffers: this._subMesh.vertexInput.buffers.map(view => view.buffer),
                offsets: this._subMesh.vertexInput.offsets
            }
            const indexInput: IndexInput | undefined = this._subMesh.indexInput && {
                buffer: this._subMesh.indexInput.buffer.buffer,
                offset: this._subMesh.indexInput.offset,
                type: this._subMesh.indexInput.type
            }
            for (let i = 0; i < this.passes.length; i++) {
                const inputAssembler = gfx.createInputAssembler();
                inputAssembler.initialize({
                    vertexInputState: this._vertexInputStates[i],
                    vertexInput,
                    indexInput
                })
                this._inputAssemblers[i] = inputAssembler;
            }
            this._inputAssemblerInvalidated = false;
        }
        for (const pass of this.passes) {
            pass.update();
        }
    }
}