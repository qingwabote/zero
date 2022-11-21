import { BufferUsageFlagBits, EmptyBuffer, MemoryUsage } from "../gfx/Buffer.js";
const emptyArray = new Float32Array(0);
const emptyBuffer = new EmptyBuffer;
const format2array = {
    Uint16: Uint16Array,
    Float32: Float32Array
};
export default class BufferView {
    static Empty = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, 0);
    _data = emptyArray;
    get data() {
        return this._data;
    }
    _buffer = emptyBuffer;
    get buffer() {
        return this._buffer;
    }
    get length() {
        return this._data.length;
    }
    constructor(format, usage, length) {
        if (length == 0) {
            return;
        }
        this._data = new format2array[format](length);
        this._buffer = gfx.createBuffer();
        this._buffer.initialize({
            usage,
            mem_usage: MemoryUsage.CPU_TO_GPU,
            size: this._data.byteLength
        });
    }
    set(array, offset) {
        this._data.set(array, offset);
    }
    update() {
        this._buffer.update(this._data);
    }
}
//# sourceMappingURL=BufferView.js.map