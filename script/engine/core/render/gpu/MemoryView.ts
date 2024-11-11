import { CommandBuffer } from "gfx";

type TypedArray = Uint16Array | Uint32Array | Float32Array

export abstract class MemoryView {
    private readonly _length_default: number;

    get length(): number {
        return this._length;
    }

    get source() {
        return this._source;
    }

    get BYTES_PER_ELEMENT(): number {
        return this._source.BYTES_PER_ELEMENT;
    }

    private _invalidated_start: number = 0;
    private _invalidated_end: number = 0;

    constructor(protected _source: TypedArray, private _length: number) {
        this._length_default = _length;
    }

    set(array: ArrayLike<number>, offset: number = 0) {
        this._source.set(array, offset);
        this.invalidate(offset, array.length);
    }

    setElement(element: number, offset: number = 0) {
        this._source[offset] = element;
        this.invalidate(offset, 1);
    }

    add(array: ArrayLike<number>) {
        const offset = this._length;
        this.resize(this._length + array.length);
        this.set(array, offset);
    }

    addElement(element: number) {
        const offset = this._length;
        this.resize(this._length + 1);
        this.setElement(element, offset);
    }

    invalidate(offset: number, length: number) {
        this._invalidated_start = Math.min(offset, this._invalidated_start);
        this._invalidated_end = Math.max(offset + length, this._invalidated_end);
    }

    reset(length: number = this._length_default) {
        this.reserve(length)
        this._length = length;
    }

    resize(length: number) {
        const old = this.reserve(length);
        if (old) {
            this.set(old);
        }
        this._length = length;
    }

    shrink() { }

    update(commandBuffer: CommandBuffer) {
        const length = this._invalidated_end - this._invalidated_start;
        if (length < 1) {
            return;
        }

        this.upload(commandBuffer, this._invalidated_start, length);

        this._invalidated_start = this._invalidated_end = 0;
    }

    protected abstract upload(commandBuffer: CommandBuffer, offset: number, length: number): void;

    public abstract reserve(capacity: number): TypedArray | null;
}

export declare namespace MemoryView {
    export { TypedArray }
}