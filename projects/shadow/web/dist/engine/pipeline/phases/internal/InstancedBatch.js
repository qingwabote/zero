import { BufferUsageFlagBits, Format, InputAssembler, VertexAttribute } from "gfx";
import { BufferView } from "../../../core/render/BufferView.js";
import { PeriodicFlag } from "../../../core/render/scene/PeriodicFlag.js";
import { shaderLib } from "../../../core/shaderLib.js";
const inputAssembler_clone = (function () {
    function vertexInput_clone(out, vertexInput) {
        const buffers = vertexInput.buffers;
        const buffers_size = buffers.size();
        for (let i = 0; i < buffers_size; i++) {
            out.buffers.add(buffers.get(i));
        }
        const offsets = vertexInput.offsets;
        const offsets_size = offsets.size();
        for (let i = 0; i < offsets_size; i++) {
            out.offsets.add(offsets.get(i));
        }
        return out;
    }
    return function (inputAssembler) {
        const out = new InputAssembler;
        const vertexAttributes = inputAssembler.vertexAttributes;
        const size = vertexAttributes.size();
        for (let i = 0; i < size; i++) {
            out.vertexAttributes.add(vertexAttributes.get(i));
        }
        vertexInput_clone(out.vertexInput, inputAssembler.vertexInput);
        if (inputAssembler.indexInput) {
            out.indexInput = inputAssembler.indexInput;
        }
        return out;
    };
})();
const local_empty = { descriptorSetLayout: shaderLib.descriptorSetLayout_empty };
function createModelAttribute(column, buffer) {
    const vec4 = new VertexAttribute;
    vec4.name = shaderLib.attributes.model.name;
    vec4.instanced = true;
    vec4.format = Format.RGBA32_SFLOAT;
    vec4.location = shaderLib.attributes.model.location + column;
    vec4.offset = 16 * column;
    vec4.buffer = buffer;
    return vec4;
}
export var InstanceBatch;
(function (InstanceBatch) {
    class Single {
        get local() {
            return this.model;
        }
        get material() {
            return this.model.materials[this._subIndex];
        }
        get draw() {
            return this.model.mesh.subMeshes[this._subIndex].draw;
        }
        get count() {
            return 1;
        }
        constructor(model, _subIndex) {
            this.model = model;
            this._subIndex = _subIndex;
            this._buffer = new BufferView('Float32', BufferUsageFlagBits.VERTEX, 16);
            this._hasUpdated = new PeriodicFlag();
            const subMesh = model.mesh.subMeshes[_subIndex];
            const inputAssembler = inputAssembler_clone(subMesh.inputAssembler);
            const bufferIndex = inputAssembler.vertexInput.buffers.size();
            for (let i = 0; i < 4; i++) {
                inputAssembler.vertexAttributes.add(createModelAttribute(i, bufferIndex));
            }
            inputAssembler.vertexInput.buffers.add(this._buffer.buffer);
            inputAssembler.vertexInput.offsets.add(0);
            this.inputAssembler = inputAssembler;
        }
        update() {
            if (this._hasUpdated.value) {
                return;
            }
            if (this.model.transform.hasChanged) {
                this._buffer.set(this.model.transform.world_matrix);
                this._buffer.update();
            }
            this._hasUpdated.clear(1);
        }
    }
    InstanceBatch.Single = Single;
    class Multiple {
        get local() { return local_empty; }
        get count() {
            return this._count;
        }
        constructor(material, inputAssembler, draw, _capacity = 32) {
            this.material = material;
            this._capacity = _capacity;
            this._count = 1;
            const ia = inputAssembler_clone(inputAssembler);
            const buffer = new BufferView('Float32', BufferUsageFlagBits.VERTEX, 16 * _capacity);
            const bufferIndex = ia.vertexInput.buffers.size();
            for (let i = 0; i < 4; i++) {
                ia.vertexAttributes.add(createModelAttribute(i, bufferIndex));
            }
            ia.vertexInput.buffers.add(buffer.buffer);
            ia.vertexInput.offsets.add(0);
            this._buffer = buffer;
            this.inputAssembler = ia;
            this.draw = { count: draw.count, first: draw.first };
        }
        update() {
            throw new Error("Method not implemented.");
        }
    }
    InstanceBatch.Multiple = Multiple;
})(InstanceBatch || (InstanceBatch = {}));