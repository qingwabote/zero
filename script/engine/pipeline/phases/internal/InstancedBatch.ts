import { TypedArrayLike } from "bastard";
import { device } from "boot";
import { BufferUsageFlagBits, CommandBuffer, DescriptorSet, DescriptorSetLayout, DescriptorType, ShaderStageFlagBits, Uint32Vector } from "gfx";
import { Draw } from "../../../core/render/Draw.js";
import { BufferView } from "../../../core/render/gfx/BufferView.js";
import { Batch } from "../../../core/render/pipeline/Batch.js";
import { shaderLib } from "../../../core/shaderLib.js";

const instanceLayout: DescriptorSetLayout = shaderLib.createDescriptorSetLayout([{
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    stageFlags: ShaderStageFlagBits.VERTEX,
    binding: 0
}]);

if (device.capabilities.uniformBufferOffsetAlignment % 4 != 0) {
    throw new Error(`unexpected uniformBufferOffsetAlignment ${device.capabilities.uniformBufferOffsetAlignment}`);
}
if (16 * 1024 % device.capabilities.uniformBufferOffsetAlignment != 0) {
    throw new Error(`unexpected uniformBufferOffsetAlignment ${device.capabilities.uniformBufferOffsetAlignment}`);
}

const dynamicOffsets = new Uint32Vector;
dynamicOffsets.add(0);

export class InstancedBatch implements Batch {
    readonly instance: DescriptorSet;
    private readonly _data: BufferView;

    private _count: number = 0
    get count(): number {
        return this._count;
    }

    private _frozen = false;
    get frozen(): boolean {
        return this._frozen;
    }

    private _add_return: [TypedArrayLike, number] = [null!, 0];

    constructor(readonly draw: Draw, private readonly _stride: number, readonly local?: DescriptorSet) {
        const view = new BufferView('f32', BufferUsageFlagBits.UNIFORM, 0, 4096);
        const descriptorSet = device.createDescriptorSet(instanceLayout);
        descriptorSet.bindBuffer(0, view.buffer, 16 * 1024);

        this.instance = descriptorSet;
        this._data = view;
    }

    add() {
        const stride = this._stride;
        const count = ++this._count;

        const range_instances = Math.floor(4096 / stride);
        const gap = 4096 % stride;
        const n = Math.ceil(count / range_instances);

        this._data.resize(4096 * n);

        this._add_return[0] = this._data.source;
        this._add_return[1] = stride * (count - 1) + gap * (n - 1);

        return this._add_return;
    }

    freeze() {
        this._frozen = true;
    }

    *flush(commandBuffer: CommandBuffer): IterableIterator<number> {
        const stride = this._stride;
        const count = this._count;

        const range_instances = Math.floor(4096 / stride);
        const gap = 4096 % stride;
        const n = Math.ceil(count / range_instances);

        this._data.invalidate(0, stride * count + gap * (n - 1))
        this._data.update(commandBuffer);

        for (let i = 0; i < n; i++) {
            dynamicOffsets.set(0, 16 * 1024 * i);
            commandBuffer.bindDescriptorSet(shaderLib.sets.instance.index, this.instance, dynamicOffsets);
            yield Math.min(range_instances, count - range_instances * i);
        }

        this._data.reset();
        this._count = 0;
        this._frozen = false;
    }
}