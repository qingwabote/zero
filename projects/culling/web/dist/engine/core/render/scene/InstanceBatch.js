import { BufferUsageFlagBits, Format, InputAssembler, VertexAttribute } from "gfx";
import { shaderLib } from "../../shaderLib.js";
import { BufferView } from "../gpu/BufferView.js";
import { PeriodicFlag } from "./PeriodicFlag.js";
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
        const vertexAttributes = inputAssembler.vertexInputState.attributes;
        const size = vertexAttributes.size();
        for (let i = 0; i < size; i++) {
            out.vertexInputState.attributes.add(vertexAttributes.get(i));
        }
        out.vertexInputState.primitive = inputAssembler.vertexInputState.primitive;
        vertexInput_clone(out.vertexInput, inputAssembler.vertexInput);
        if (inputAssembler.indexInput) {
            out.indexInput = inputAssembler.indexInput;
        }
        return out;
    };
})();
function createModelAttribute(buffer) {
    const mat4 = new VertexAttribute;
    mat4.location = shaderLib.attributes.model.location;
    mat4.format = Format.RGBA32_SFLOAT;
    mat4.buffer = buffer;
    mat4.instanced = true;
    mat4.multiple = 4;
    return mat4;
}
export class InstanceBatch {
    get count() {
        return this._count;
    }
    get locked() {
        return this._lockedFlag.value != 0;
    }
    constructor(subMesh, descriptorSetLayout, descriptorSet, uniforms) {
        this.descriptorSetLayout = descriptorSetLayout;
        this.descriptorSet = descriptorSet;
        this.uniforms = uniforms;
        this._count = 0;
        this._lockedFlag = new PeriodicFlag();
        const view = new BufferView('Float32', BufferUsageFlagBits.VERTEX);
        const ia = inputAssembler_clone(subMesh.inputAssembler);
        ia.vertexInputState.attributes.add(createModelAttribute(ia.vertexInput.buffers.size()));
        ia.vertexInput.buffers.add(view.buffer);
        ia.vertexInput.offsets.add(0);
        this.vertex = view;
        this.inputAssembler = ia;
        this.draw = subMesh.draw;
    }
    next() {
        this._count++;
    }
    upload(commandBuffer) {
        this.vertex.update(commandBuffer);
        for (const key in this.uniforms) {
            this.uniforms[key].update(commandBuffer);
        }
        this._lockedFlag.reset(1);
    }
    recycle() {
        this._count = 0;
    }
}
