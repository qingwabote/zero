import Buffer, { BufferUsageFlagBits, EmptyBuffer, MemoryUsage } from "../gfx/Buffer.js";

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

    private _data: TypedArray = emptyArray;
    get data(): TypedArray {
        return this._data;
    }

    private _buffer: Buffer = emptyBuffer;
    get buffer(): Buffer {
        return this._buffer;
    }

    get length(): number {
        return this._data.length;
    }

    constructor(format: TypedArrayFormat, usage: BufferUsageFlagBits, length: number) {
        if (length == 0) {
            return;
        }
        this._data = new format2array[format](length);
        this._buffer = gfx.createBuffer();
        this._buffer.initialize({
            usage,
            mem_usage: MemoryUsage.CPU_TO_GPU,
            size: this._data.byteLength
        });
    }

    set(array: ArrayLike<number>, offset?: number) {
        this._data.set(array, offset);
    }

    update() {
        this._buffer.update(this._data);
    }
}