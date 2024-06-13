import { BufferUsageFlagBits, DescriptorSet, DescriptorSetLayout, Format, InputAssembler, VertexAttribute, VertexInput } from "gfx";
import { Mat4 } from "../../../core/math/mat4.js";
import { BufferView } from "../../../core/render/BufferView.js";
import { Material } from "../../../core/render/scene/Material.js";
import { Model } from "../../../core/render/scene/Model.js";
import { PeriodicFlag } from "../../../core/render/scene/PeriodicFlag.js";
import { SubMesh } from "../../../core/render/scene/SubMesh.js";
import { shaderLib } from "../../../core/shaderLib.js";

interface Local {
    readonly descriptorSetLayout: DescriptorSetLayout,
    readonly descriptorSet?: DescriptorSet,
}

export interface InstanceBatch {
    readonly local: Local
    readonly material: Material
    readonly inputAssembler: InputAssembler
    readonly draw: Readonly<SubMesh.Draw>
    readonly count: number

    upload(): void;
    recycle(): void;
}

const inputAssembler_clone = (function () {
    function vertexInput_clone(out: VertexInput, vertexInput: VertexInput): VertexInput {
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

    return function (inputAssembler: InputAssembler): InputAssembler {
        const out = new InputAssembler;

        const vertexAttributes = inputAssembler.vertexAttributes
        const size = vertexAttributes.size();
        for (let i = 0; i < size; i++) {
            out.vertexAttributes.add(vertexAttributes.get(i));
        }

        vertexInput_clone(out.vertexInput, inputAssembler.vertexInput);

        if (inputAssembler.indexInput) {
            out.indexInput = inputAssembler.indexInput;
        }

        return out;
    }
})()

const local_empty: Local = { descriptorSetLayout: shaderLib.descriptorSetLayout_empty }

function createModelAttribute(column: number, buffer: number) {
    const vec4 = new VertexAttribute;
    vec4.name = shaderLib.attributes.model.name;
    vec4.instanced = true;
    vec4.format = Format.RGBA32_SFLOAT;
    vec4.location = shaderLib.attributes.model.location + column;
    vec4.offset = 16 * column;
    vec4.buffer = buffer;
    return vec4;
}

export namespace InstanceBatch {
    export class Single implements InstanceBatch {
        private readonly _buffer: BufferView = new BufferView('Float32', BufferUsageFlagBits.VERTEX, 16)

        readonly inputAssembler: InputAssembler;

        get local(): Local {
            return this.model;
        }

        get material(): Material {
            return this.model.materials[this._subIndex];
        }

        get draw(): Readonly<SubMesh.Draw> {
            return this.model.mesh.subMeshes[this._subIndex].draw;
        }

        get count(): number {
            return 1
        }

        private _hasUpdated = new PeriodicFlag();

        constructor(public model: Model, private _subIndex: number) {
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

        upload() {
            if (this._hasUpdated.value) {
                return;
            }

            // if (this.model.transform.hasChanged) {
            this._buffer.set(this.model.transform.world_matrix);
            this._buffer.update();
            // }

            this._hasUpdated.reset(1);
        }

        recycle(): void { };
    }

    export class Multiple implements InstanceBatch {
        get local(): Local { return local_empty; }

        readonly inputAssembler: InputAssembler;

        get draw(): Readonly<SubMesh.Draw> {
            return this._subMesh.draw;
        }

        private _count = 0;
        get count(): number {
            return this._count;
        }

        private readonly _view: BufferView = new BufferView('Float32', BufferUsageFlagBits.VERTEX);

        private _locked = new PeriodicFlag();
        get locked(): boolean {
            return this._locked.value != 0;
        }

        constructor(private _subMesh: SubMesh, readonly material: Material) {
            const ia = inputAssembler_clone(_subMesh.inputAssembler);
            const bufferIndex = ia.vertexInput.buffers.size();
            for (let i = 0; i < 4; i++) {
                ia.vertexAttributes.add(createModelAttribute(i, bufferIndex));
            }
            ia.vertexInput.buffers.add(this._view.buffer);
            ia.vertexInput.offsets.add(0);
            this.inputAssembler = ia;
        }

        add(transform: Readonly<Mat4>) {
            this._view.resize(16 * (this._count + 1));
            this._view.set(transform, 16 * this._count);
            this._count++;
        }

        upload(): void {
            this._view.update();
            this._locked.reset(1);
        }

        recycle(): void {
            this._count = 0;
        }
    }
}