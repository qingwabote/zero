import { Buffer, BufferUsageFlagBits, EmptyBuffer, MemoryUsage, impl } from "gfx-main";
import { device } from "../../../impl.js";
import { BufferView } from "./BufferView.js";

const emptyArray = new Float32Array(0);
const emptyBuffer = new EmptyBuffer;
emptyBuffer.initialize({} as any)

export interface ArrayLikeWritable<T> {
    readonly length: number;
    [n: number]: T;
}

export type TypedArray = Uint16Array | Float32Array;

export type TypedArrayFormat = keyof typeof format2array;

const format2array = {
    Uint16: Uint16Array,
    Float32: Float32Array
} as const

export class BufferViewWritable implements BufferView {
    private _source: TypedArray = emptyArray;

    private _proxy: any;
    get data(): ArrayLikeWritable<number> {
        return this._proxy as any;
    }

    get length(): number {
        return this._length;
    }

    private _buffer: Buffer = emptyBuffer;
    get buffer(): Buffer {
        return this._buffer;
    }

    get BYTES_PER_ELEMENT(): number {
        return this._source.BYTES_PER_ELEMENT;
    }

    private _capacity = 0;

    private _dirty: boolean = false;

    constructor(private _format: TypedArrayFormat, private _usage: BufferUsageFlagBits, private _length: number = 0) {
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

        if (_length == 0) {
            return;
        }

        this.reset(_length);
    }

    reset(length: number) {
        this._length = length;
        if (this._capacity < length) {
            this.reserve(length)
        }
    }

    resize(length: number) {
        this._length = length;
        if (this._capacity < length) {
            const old = this._source;
            this.reserve(length);
            this.set(old);
        }
    }

    reserve(capacity: number) {
        if (this._capacity >= capacity) {
            return;
        }
        this._source = new format2array[this._format](capacity);
        if (this._buffer == emptyBuffer) {
            this._buffer = device.createBuffer();
            const info = new impl.BufferInfo;
            info.usage = this._usage;
            info.mem_usage = MemoryUsage.CPU_TO_GPU;
            info.size = this._source.byteLength
            this._buffer.initialize(info);
        } else {
            this._buffer.resize(this._source.byteLength);
        }
        this._capacity = capacity;
    }

    shrink() { }

    set(array: ArrayLike<number>, offset?: number) {
        this._source.set(array, offset);
        this._dirty = true;
    }

    update() {
        if (!this._dirty) {
            return;
        }
        this._buffer.update(this._source.buffer, this._source.byteOffset, this._length * this._source.BYTES_PER_ELEMENT);
        this._dirty = false;
    }
}