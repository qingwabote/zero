export class MemoryView {
    get length() {
        return this._length;
    }
    get source() {
        return this._source;
    }
    get BYTES_PER_ELEMENT() {
        return this._source.BYTES_PER_ELEMENT;
    }
    constructor(_source, _length) {
        this._source = _source;
        this._length = _length;
        this._invalidated = false;
        this._length_default = _length;
    }
    set(array, offset) {
        this._source.set(array, offset);
        this.invalidate();
    }
    setElement(element, offset) {
        this._source[offset] = element;
        this.invalidate();
    }
    add(array) {
        const offset = this._length;
        this.resize(this._length + array.length);
        this.set(array, offset);
    }
    addElement(element) {
        const offset = this._length;
        this.resize(this._length + 1);
        this.setElement(element, offset);
    }
    invalidate() {
        this._invalidated = true;
    }
    reset(length = this._length_default) {
        this.reserve(length);
        this._length = length;
    }
    resize(length) {
        const old = this.reserve(length);
        if (old) {
            this.set(old);
        }
        this._length = length;
    }
    shrink() { }
    update(commandBuffer) {
        if (!this._invalidated) {
            return;
        }
        this.upload(commandBuffer);
        this._invalidated = false;
    }
}
