import { device } from "boot";
import { BufferInfo } from "gfx";
import { MemoryView } from "./MemoryView.js";
const format2array = {
    Uint16: Uint16Array,
    Uint32: Uint32Array,
    Float32: Float32Array
};
export class BufferView extends MemoryView {
    get buffer() {
        return this._buffer;
    }
    constructor(_format, usage, length = 0, capacity = 0) {
        const source = new format2array[_format](Math.max(capacity, length));
        super(source, length);
        this._format = _format;
        const info = new BufferInfo;
        info.usage = usage;
        info.size = source.byteLength;
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
    upload(commandBuffer, offset, length) {
        const bytes = this.length * this._source.BYTES_PER_ELEMENT;
        if (this._buffer.info.size < bytes) {
            this._buffer.resize(bytes);
            offset = 0;
            length = this.length;
        }
        this._buffer.update(this._source, offset, length);
    }
}
