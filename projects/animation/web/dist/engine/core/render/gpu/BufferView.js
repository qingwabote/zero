import { device } from "boot";
import { BufferInfo } from "gfx";
import { MemoryView } from "./MemoryView.js";
const format2array = {
    Uint16: Uint16Array,
    Float32: Float32Array
};
export class BufferView extends MemoryView {
    get buffer() {
        return this._buffer;
    }
    constructor(_format, usage, length = 0) {
        super(new format2array[_format](length), length);
        this._format = _format;
        const info = new BufferInfo;
        info.usage = usage;
        info.size = this._source.byteLength;
        this._buffer = device.createBuffer(info);
    }
    reserve(capacity) {
        if (this._source.length >= capacity) {
            return null;
        }
        const old = this._source;
        this._source = new format2array[this._format](capacity);
        return old;
    }
    upload() {
        const bytes = this.length * this._source.BYTES_PER_ELEMENT;
        if (this._buffer.info.size < bytes) {
            this._buffer.resize(bytes);
        }
        this._buffer.update(this._source, 0, this.length);
    }
}