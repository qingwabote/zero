import { CommandBuffer } from "gfx";
import { pk } from "puttyknife";

type Store = {
    [index: number]: number;
    readonly length: number;
}

function format2bytes(format: keyof pk.ArrayTypes) {
    switch (format) {
        case 'u16':
            return 2;
        case 'u32':
        case 'f32':
            return 4;
        default:
            throw new Error(`unsupported format: ${format}`);
    }
}

export abstract class MemoryView {
    get length(): number {
        return this._length;
    }

    protected _source: pk.TypedArray
    get source(): Store {
        return this._source;
    }

    private _handle: pk.BufferHandle
    get handle(): pk.BufferHandle {
        return this._handle;
    }

    get BYTES_PER_ELEMENT(): number {
        return this._source.BYTES_PER_ELEMENT;
    }

    private _invalidated_start: number = Number.MAX_SAFE_INTEGER;
    private _invalidated_end: number = Number.MIN_SAFE_INTEGER;

    private readonly _length_default: number;

    constructor(private readonly _format: keyof pk.ArrayTypes, private _length: number, capacity: number = 0) {
        capacity = Math.max(_length, capacity);
        const handle = pk.heap.newBuffer(capacity * format2bytes(_format), 0);
        this._source = pk.heap.getBuffer(handle, _format, capacity);
        this._handle = handle;
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
            this.set(old.source);
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

    protected reserve(capacity: number): { handle: pk.BufferHandle, source: pk.TypedArray } | null {
        if (this._source.length >= capacity) {
            return null;
        }
        const old = { handle: this._handle, source: this._source };
        const handle = pk.heap.newBuffer(capacity * format2bytes(this._format), 0);
        this._source = pk.heap.getBuffer(handle, this._format, capacity);
        this._handle = handle;
        return old;
    }

    protected abstract upload(commandBuffer: CommandBuffer, offset: number, length: number): void;
}