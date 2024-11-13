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
        this._block = [undefined, 0];
        this._invalidated_start = Number.MAX_SAFE_INTEGER;
        this._invalidated_end = Number.MIN_SAFE_INTEGER;
        this._length_default = _length;
    }
    set(array, offset = 0) {
        this._source.set(array, offset);
        this.invalidate(offset, array.length);
    }
    setElement(element, offset = 0) {
        this._source[offset] = element;
        this.invalidate(offset, 1);
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
    addBlock(length) {
        const offset = this._length;
        this.resize(offset + length);
        this.invalidate(offset, length);
        this._block[0] = this._source;
        this._block[1] = offset;
        return this._block;
    }
    invalidate(offset, length) {
        this._invalidated_start = Math.min(offset, this._invalidated_start);
        this._invalidated_end = Math.max(offset + length, this._invalidated_end);
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
        const length = this._invalidated_end - this._invalidated_start;
        if (length < 1) {
            return;
        }
        this.upload(commandBuffer, this._invalidated_start, length);
        this._invalidated_start = Number.MAX_SAFE_INTEGER;
        this._invalidated_end = Number.MIN_SAFE_INTEGER;
        ;
    }
}
