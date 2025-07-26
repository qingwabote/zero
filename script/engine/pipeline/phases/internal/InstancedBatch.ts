import { device } from "boot";
import { BufferUsageFlagBits, CommandBuffer, DescriptorSet, DescriptorSetLayout, DescriptorType, ShaderStageFlagBits } from "gfx";
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
const alignment = device.capabilities.uniformBufferOffsetAlignment / 4;

export class InstancedBatch implements Batch {
    readonly instance: DescriptorSet;
    readonly data: BufferView;

    private _count: number = 0
    get count(): number {
        return this._count;
    }

    private _frozen = false;
    get frozen(): boolean {
        return this._frozen;
    }

    private _current: [number, number] = [0, 0];

    constructor(readonly draw: Draw, private readonly _stride: number, readonly local: DescriptorSet | null = null) {
        const range_instances = Math.floor(4096 / _stride);
        const range_floats = _stride * range_instances;

        const view = new BufferView('f32', BufferUsageFlagBits.UNIFORM, 0, range_floats);
        const descriptorSet = device.createDescriptorSet(instanceLayout);
        descriptorSet.bindBuffer(0, view.buffer, range_floats * 4);

        this.instance = descriptorSet;
        this.data = view;
    }

    add(): number {
        const stride = this._stride;
        const count = ++this._count;

        const range_instances = Math.floor(4096 / stride);
        const range_floats = stride * range_instances;
        const gap = alignment - range_floats % alignment;
        const n = Math.ceil(count / range_instances);

        this.data.resize((range_floats + gap) * n);

        return stride * (count - 1) + gap * (n - 1);
    }

    freeze() {
        this._frozen = true;
    }

    *flush(commandBuffer: CommandBuffer): IterableIterator<[number, number]> {
        const stride = this._stride;
        const count = this._count;

        const range_instances = Math.floor(4096 / stride);
        const range_floats = stride * range_instances;
        const gap = alignment - range_floats % alignment;
        const n = Math.ceil(count / range_instances);

        this.data.invalidate(0, stride * count + gap * (n - 1))
        this.data.update(commandBuffer);

        const current = this._current;
        for (let i = 0; i < n; i++) {
            current[0] = Math.min(range_instances, count - range_instances * i);
            current[1] = (range_floats + gap) * i * 4;
            yield current;
        }

        this.data.reset();
        this._count = 0;
        this._frozen = false;
    }
}