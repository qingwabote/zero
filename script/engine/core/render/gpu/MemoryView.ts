
const format2array = {
    Uint16: Uint16Array,
    Float32: Float32Array
} as const

type Format = keyof typeof format2array;

interface TypedArray {
    readonly BYTES_PER_ELEMENT: number;
    readonly buffer: ArrayBufferLike;
    readonly byteLength: number;
    readonly length: number;
    set(array: ArrayLike<number>, offset?: number): void;
    [index: number]: number;
}

export abstract class MemoryView {
    get length(): number {
        return this._length;
    }

    private _source: TypedArray;
    get source() {
        return this._source;
    }

    get BYTES_PER_ELEMENT(): number {
        return this._source.BYTES_PER_ELEMENT;
    }

    protected _invalidated: boolean = false;

    constructor(private _format: Format, private _length: number) {
        this._source = new format2array[_format](_length);
    }

    set(array: ArrayLike<number>, offset?: number) {
        this._source.set(array, offset);
        this.invalidate();
    }

    invalidate() {
        this._invalidated = true;
    }

    reset(length: number) {
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

    reserve(capacity: number): TypedArray | null {
        if (this._source.length >= capacity) {
            return null;
        }
        const old = this._source;
        this._source = new format2array[this._format](capacity);
        return old;
    }

    shrink() { }

    update() {
        if (!this._invalidated) {
            return;
        }

        this.upload(this.source.buffer, this.length * this._source.BYTES_PER_ELEMENT);

        this._invalidated = false;
    }

    abstract upload(binary: ArrayBuffer, range: number): void;
}

export declare namespace MemoryView {
    export { Format }
}