import BufferView from "./BufferView.js";
const noop = function () { };
export default class BufferViewResizable {
    _bufferView = BufferView.Empty;
    get data() {
        return this._bufferView.data;
    }
    get buffer() {
        return this._bufferView.buffer;
    }
    _format;
    _usage;
    _onReallocate;
    constructor(format, usage, onReallocate = noop) {
        this._format = format;
        this._usage = usage;
        this._onReallocate = onReallocate;
    }
    reset(length) {
        if (this._bufferView.length >= length) {
            return;
        }
        this._bufferView = new BufferView(this._format, this._usage, length);
        this._onReallocate(this._bufferView.buffer);
    }
    resize(length) {
        if (this._bufferView.length >= length) {
            return;
        }
        const data = this._bufferView.data;
        this._bufferView = new BufferView(this._format, this._usage, length);
        this._bufferView.set(data);
        this._onReallocate(this._bufferView.buffer);
    }
    shrink() {
    }
    set(array, offset) {
        this._bufferView.set(array, offset);
    }
    update() {
        this._bufferView.update();
    }
}
//# sourceMappingURL=BufferViewResizable.js.map