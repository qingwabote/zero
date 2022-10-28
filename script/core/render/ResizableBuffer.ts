import Buffer, { BufferUsageFlagBits, EmptyBuffer, MemoryUsage } from "../gfx/Buffer.js";
import { DescriptorSet } from "../gfx/Pipeline.js";

const emptyFloat32Array = new Float32Array(0);
const emptyBuffer = new EmptyBuffer;

export default class ResizableBuffer {
    private _array: Float32Array = emptyFloat32Array;
    private _buffer: Buffer = emptyBuffer;

    private _descriptorSet: DescriptorSet;
    private _binding: number;
    private _range?: number;

    constructor(descriptorSet: DescriptorSet, binding: number, range?: number) {
        this._descriptorSet = descriptorSet;
        this._binding = binding;
        this._range = range;
    }

    reset(length: number) {
        if (this._array.length >= length) {
            return;
        }

        this._array = new Float32Array(length);
    }

    set(array: ArrayLike<number>, offset?: number) {
        this._array.set(array, offset);
    }

    update() {
        if (this._buffer.info.size < this._array.byteLength) {
            this._buffer.destroy();
            this._buffer = gfx.createBuffer();
            this._buffer.initialize({ usage: BufferUsageFlagBits.UNIFORM, mem_usage: MemoryUsage.CPU_TO_GPU, size: this._array.byteLength });
        }
        this._buffer.update(this._array);
        this._descriptorSet.bindBuffer(this._binding, this._buffer, this._range);
    }
}