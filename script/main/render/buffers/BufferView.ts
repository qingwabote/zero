import Buffer, { BufferUsageFlagBits, EmptyBuffer, MemoryUsage } from "../../gfx/Buffer.js";

export interface ArrayLikeWritable<T> {
    readonly length: number;
    [n: number]: T;
}

const emptyArray = new Float32Array(0);
const emptyBuffer = new EmptyBuffer;

export type TypedArray = Uint16Array | Float32Array;

const format2array = {
    Uint16: Uint16Array,
    Float32: Float32Array
} as const

export type TypedArrayFormat = keyof typeof format2array;

export default class BufferView {
    static readonly Empty = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, 0);

    private _source: TypedArray = emptyArray;

    private _proxy: any;
    get data(): ArrayLikeWritable<number> {
        return this._proxy as any;
    }

    get length(): number {
        return this._source.length;
    }

    private _buffer: Buffer = emptyBuffer;
    get buffer(): Buffer {
        return this._buffer;
    }

    get BYTES_PER_ELEMENT(): number {
        return this._source.BYTES_PER_ELEMENT;
    }

    private _dirty: boolean = false;

    constructor(format: TypedArrayFormat, usage: BufferUsageFlagBits, length: number) {
        this._proxy = new Proxy(this, {
            get(target, p) {
                return Reflect.get(target._source, p);
            },
            set(target, p, newValue) {
                if (Reflect.set(target._source, p, newValue)) {
                    target._dirty = true;
                    return true;
                }
                return false;
            }
        })

        if (length == 0) {
            return;
        }

        this._source = new format2array[format](length);
        this._buffer = gfx.createBuffer();
        this._buffer.initialize({
            usage,
            mem_usage: MemoryUsage.CPU_TO_GPU,
            size: this._source.byteLength
        });
    }

    set(array: ArrayLike<number>, offset?: number) {
        this._source.set(array, offset);
        this._dirty = true;
    }

    update(length?: number) {
        if (!this._dirty) {
            return;
        }
        let size;
        if (length) {
            size = length * this._source.BYTES_PER_ELEMENT
        }
        this._buffer.update(new DataView(this._source.buffer, this._source.byteOffset, size));
        this._dirty = false;
    }
}