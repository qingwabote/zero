import { device } from "boot";
import { BufferUsageFlagBits, DescriptorSetLayoutInfo, Format, InputAssembler, PrimitiveTopology, VertexAttribute } from "gfx";
import { Zero } from "../../../core/Zero.js";
import { BufferView } from "../../../core/render/BufferView.js";
import { PeriodicFlag } from "../../../core/render/scene/PeriodicFlag.js";
import { shaderLib } from "../../../core/shaderLib.js";
const local_empty = { descriptorSetLayout: device.createDescriptorSetLayout(new DescriptorSetLayoutInfo) };
export class InstanceBatch {
    constructor(_inputAssembler, _draw, _count, _local = local_empty) {
        this._inputAssembler = _inputAssembler;
        this._draw = _draw;
        this._count = _count;
        this._local = _local;
    }
    record(profile, commandBuffer, renderPass, context, pass) {
        this.upload();
        if (this._local.descriptorSet) {
            commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, this._local.descriptorSet);
        }
        const pipeline = context.getPipeline(pass.state, this._inputAssembler.vertexInputState, renderPass, [pass.descriptorSetLayout, this._local.descriptorSetLayout]);
        commandBuffer.bindPipeline(pipeline);
        commandBuffer.bindInputAssembler(this._inputAssembler);
        let alignment;
        switch (this._inputAssembler.vertexInputState.primitive) {
            case PrimitiveTopology.LINE_LIST:
                alignment = 2;
                break;
            case PrimitiveTopology.TRIANGLE_LIST:
                alignment = 3;
                break;
            default:
                throw `unsupported primitive: ${this._inputAssembler.vertexInputState.primitive}`;
        }
        const subCount = Math.ceil(this._draw.count / InstanceBatch.subDraws / alignment) * alignment;
        let count = 0;
        while (count < this._draw.count) {
            if (this._inputAssembler.indexInput) {
                commandBuffer.drawIndexed(count + subCount > this._draw.count ? this._draw.count - count : subCount, this._draw.first + count, this._count);
            }
            else {
                commandBuffer.draw(count + subCount > this._draw.count ? this._draw.count - count : subCount, this._draw.first + count, this._count);
            }
            count += subCount;
            profile.draws++;
        }
        this.recycle();
    }
    recycle() { }
}
InstanceBatch.subDraws = 1;
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
(function (InstanceBatch) {
    class Single extends InstanceBatch {
        constructor(model, subIndex) {
            const view = new BufferView('Float32', BufferUsageFlagBits.VERTEX, 16);
            const subMesh = model.mesh.subMeshes[subIndex];
            const inputAssembler = inputAssembler_clone(subMesh.inputAssembler);
            const bufferIndex = inputAssembler.vertexInput.buffers.size();
            inputAssembler.vertexInputState.attributes.add(createModelAttribute(bufferIndex));
            inputAssembler.vertexInput.buffers.add(view.buffer);
            inputAssembler.vertexInput.offsets.add(0);
            super(inputAssembler, subMesh.draw, 1, model);
            this.model = model;
            this._view = new BufferView('Float32', BufferUsageFlagBits.VERTEX, 16);
            this._lastUploadFrame = -1;
            this._view = view;
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
    }
    InstanceBatch.Single = Single;
    class Multiple extends InstanceBatch {
        get count() {
            return this._count;
        }
        get locked() {
            return this._lockedFlag.value != 0;
        }
        constructor(subMesh) {
            const view = new BufferView('Float32', BufferUsageFlagBits.VERTEX);
            const ia = inputAssembler_clone(subMesh.inputAssembler);
            const bufferIndex = ia.vertexInput.buffers.size();
            ia.vertexInputState.attributes.add(createModelAttribute(bufferIndex));
            ia.vertexInput.buffers.add(view.buffer);
            ia.vertexInput.offsets.add(0);
            super(ia, subMesh.draw, 0);
            this._view = new BufferView('Float32', BufferUsageFlagBits.VERTEX);
            this._lockedFlag = new PeriodicFlag();
            this._view = view;
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
