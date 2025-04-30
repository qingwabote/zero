import { CommandBuffer } from "gfx";
import { pk } from "puttyknife";

type View = {
    [index: number]: number;
    readonly length: number;
}

export abstract class MemoryView {
    get length(): number {
        return this._length;
    }

    get view(): View {
        return this._view;
    }

    get handle(): pk.BufferHandle {
        return this._handle;
    }

    get BYTES_PER_ELEMENT(): number {
        return this._view.BYTES_PER_ELEMENT;
    }

    private _invalidated_start: number = Number.MAX_SAFE_INTEGER;
    private _invalidated_end: number = Number.MIN_SAFE_INTEGER;

    private readonly _length_default: number;

    constructor(protected _handle: pk.BufferHandle, protected _view: pk.TypedArray, private _length: number) {
        this._length_default = _length;
    }

    set(array: ArrayLike<number>, offset: number = 0) {
        this._view.set(array, offset);
        this.invalidate(offset, array.length);
    }

    setElement(element: number, offset: number = 0) {
        this._view[offset] = element;
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

    addBlock(length: number): number {
        const offset = this._length;
        this.resize(offset + length);
        this.invalidate(offset, length);
        return offset;
    }

    invalidate(offset: number, length: number) {
        this._invalidated_start = Math.min(offset, this._invalidated_start);
        this._invalidated_end = Math.max(offset + length, this._invalidated_end);
    }

    reset(length: number = this._length_default) {
        const old = this.reserve(length);
        if (old) {
            pk.heap.delBuffer(old.handle);
        }
        this._length = length;
    }

    resize(length: number) {
        const old = this.reserve(length);
        if (old) {
            this.set(old.view);
            pk.heap.delBuffer(old.handle);
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

        this._invalidated_start = Number.MAX_SAFE_INTEGER
        this._invalidated_end = Number.MIN_SAFE_INTEGER;;
    }

    protected abstract upload(commandBuffer: CommandBuffer, offset: number, length: number): void;

    public abstract reserve(capacity: number): { handle: pk.BufferHandle, view: pk.TypedArray } | null;
}