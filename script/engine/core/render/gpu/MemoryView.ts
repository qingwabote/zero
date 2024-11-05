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

    protected _invalidated: boolean = false;

    constructor(protected _source: TypedArray, private _length: number) {
        this._length_default = _length;
    }

    set(array: ArrayLike<number>, offset?: number) {
        this._source.set(array, offset);
        this.invalidate();
    }

    setElement(element: number, offset: number) {
        this._source[offset] = element;
        this.invalidate();
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

    invalidate() {
        this._invalidated = true;
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
        if (!this._invalidated) {
            return;
        }

        this.upload(commandBuffer);

        this._invalidated = false;
    }

    protected abstract upload(commandBuffer: CommandBuffer): void;

    public abstract reserve(capacity: number): TypedArray | null;
}

export declare namespace MemoryView {
    export { TypedArray }
}