import { device } from "boot";
import { BufferUsageFlagBits, DescriptorSetLayoutInfo, Format, InputAssembler, VertexAttribute } from "gfx";
import { Zero } from "../../../core/Zero.js";
import { BufferView } from "../../../core/render/BufferView.js";
import { PeriodicFlag } from "../../../core/render/scene/PeriodicFlag.js";
import { shaderLib } from "../../../core/shaderLib.js";
const descriptorSetLayout_empty = device.createDescriptorSetLayout(new DescriptorSetLayoutInfo);
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
export var InstanceBatch;
(function (InstanceBatch) {
    class Single {
        constructor(model, subIndex) {
            this.model = model;
            this.count = 1;
            this._view = new BufferView('Float32', BufferUsageFlagBits.VERTEX, 16);
            this._lastUploadFrame = -1;
            const view = new BufferView('Float32', BufferUsageFlagBits.VERTEX, 16);
            const subMesh = model.mesh.subMeshes[subIndex];
            const ia = inputAssembler_clone(subMesh.inputAssembler);
            ia.vertexInputState.attributes.add(createModelAttribute(ia.vertexInput.buffers.size()));
            ia.vertexInput.buffers.add(view.buffer);
            ia.vertexInput.offsets.add(0);
            this._view = view;
            this.descriptorSetLayout = model.descriptorSetLayout;
            if (model.descriptorSet) {
                this.descriptorSet = model.descriptorSet;
            }
            this.inputAssembler = ia;
            this.draw = subMesh.draw;
        }
        upload() {
            const frame = Zero.frameCount;
            if (frame == this._lastUploadFrame) {
                return;
            }
            if (this.model.transform.hasChangedFlag.value || frame - this._lastUploadFrame > 1) {
                this._view.set(this.model.transform.world_matrix);
                this._view.update();
            }
            this._lastUploadFrame = frame;
        }
        recycle() { }
    }
    InstanceBatch.Single = Single;
    class Multiple {
        get count() {
            return this._count;
        }
        get locked() {
            return this._lockedFlag.value != 0;
        }
        constructor(subMesh) {
            this.descriptorSetLayout = descriptorSetLayout_empty;
            this._count = 0;
            this._view = new BufferView('Float32', BufferUsageFlagBits.VERTEX);
            this._lockedFlag = new PeriodicFlag();
            const view = new BufferView('Float32', BufferUsageFlagBits.VERTEX);
            const ia = inputAssembler_clone(subMesh.inputAssembler);
            ia.vertexInputState.attributes.add(createModelAttribute(ia.vertexInput.buffers.size()));
            ia.vertexInput.buffers.add(view.buffer);
            ia.vertexInput.offsets.add(0);
            this._view = view;
            this.inputAssembler = ia;
            this.draw = subMesh.draw;
        }
        add(transform) {
            this._view.resize(16 * (this._count + 1));
            this._view.set(transform, 16 * this._count);
            this._count++;
        }
        upload() {
            this._view.update();
            this._lockedFlag.reset(1);
        }
        recycle() {
            this._count = 0;
        }
    }
    InstanceBatch.Multiple = Multiple;
})(InstanceBatch || (InstanceBatch = {}));
