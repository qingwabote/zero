import { CommandBuffer } from "gfx";

type TypedArray = Uint16Array | Float32Array

export abstract class MemoryView {
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

    constructor(protected _source: TypedArray, private _length: number) { }

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