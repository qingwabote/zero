import { device } from "boot";
import { BufferInfo, MemoryUsage } from "gfx";
const format2array = {
    Uint16: Uint16Array,
    Float32: Float32Array
};
export class BufferView {
    get length() {
        return this._length;
    }
    get buffer() {
        return this._buffer;
    }
    get source() {
        return this._source;
    }
    get BYTES_PER_ELEMENT() {
        return this._source.BYTES_PER_ELEMENT;
    }
    constructor(_format, _usage, _length = 0) {
        this._format = _format;
        this._usage = _usage;
        this._length = _length;
        this._capacity = 0;
        this._invalidated = false;
        const source = new format2array[_format](_length);
        const info = new BufferInfo;
        info.usage = _usage;
        info.mem_usage = MemoryUsage.CPU_TO_GPU;
        info.size = source.byteLength;
        [this._source, this._buffer, this._capacity] = [source, device.createBuffer(info), _length];
    }
    reset(length) {
        this._length = length;
        if (this._capacity < length) {
            this.reserve(length);
        }
    }
    resize(length) {
        this._length = length;
        if (this._capacity < length) {
            const old = this._source;
            this.reserve(length);
            this.set(old);
        }
    }
    reserve(capacity) {
        if (this._capacity >= capacity) {
            return;
        }
        this._source = new format2array[this._format](capacity);
        this._buffer.resize(this._source.byteLength);
        this._capacity = capacity;
    }
    shrink() { }
    set(array, offset) {
        this._source.set(array, offset);
        this._invalidated = true;
    }
    update() {
        if (!this._invalidated) {
            return;
        }
        this._buffer.update(this._source.buffer, this._source.byteOffset, this._length * this._source.BYTES_PER_ELEMENT);
        this._invalidated = false;
    }
    invalidate() {
        this._invalidated = true;
    }
}
