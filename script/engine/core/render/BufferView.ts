import { device } from "boot";
import { Buffer, BufferInfo, BufferUsageFlagBits, MemoryUsage } from "gfx";

const format2array = {
    Uint16: Uint16Array,
    Float32: Float32Array
} as const

export class BufferView {
    get length(): number {
        return this._length;
    }

    private _buffer: Buffer;
    get buffer(): Buffer {
        return this._buffer;
    }

    private _source: Uint16Array | Float32Array;
    get source() {
        return this._source;
    }

    get BYTES_PER_ELEMENT(): number {
        return this._source.BYTES_PER_ELEMENT;
    }

    private _capacity = 0;

    private _invalidated: boolean = false;

    constructor(private _format: keyof typeof format2array, usage: BufferUsageFlagBits, private _length: number = 0) {
        const source = new format2array[_format](_length);

        const info = new BufferInfo;
        info.usage = usage;
        info.mem_usage = MemoryUsage.CPU_TO_GPU;
        info.size = source.byteLength;

        [this._source, this._buffer, this._capacity] = [source, device.createBuffer(info), _length];
    }

    reset(length: number) {
        this._length = length;
        if (this._capacity < length) {
            this.reserve(length)
        }
    }

    resize(length: number) {
        this._length = length;
        if (this._capacity < length) {
            const old = this._source;
            this.reserve(length);
            this.set(old);
        }
    }

    reserve(capacity: number) {
        if (this._capacity >= capacity) {
            return;
        }
        this._source = new format2array[this._format](capacity);
        this._capacity = capacity;
    }

    shrink() { }

    set(array: ArrayLike<number>, offset?: number) {
        this._source.set(array, offset);
        this.invalidate();
    }

    invalidate() {
        this._invalidated = true;
    }

    update() {
        if (!this._invalidated) {
            return;
        }
        const bytes = this._length * this._source.BYTES_PER_ELEMENT;
        if (this._buffer.info.size < bytes) {
            this._buffer.resize(bytes);
        }
        this._buffer.update(this._source.buffer, this._source.byteOffset, bytes);
        this._invalidated = false;
    }
}