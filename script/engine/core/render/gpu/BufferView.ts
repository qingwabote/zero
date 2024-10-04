import { device } from "boot";
import { Buffer, BufferInfo, BufferUsageFlagBits } from "gfx";
import { MemoryView } from "./MemoryView.js";

const format2array = {
    Uint16: Uint16Array,
    Float32: Float32Array
} as const

type Format = keyof typeof format2array;

export class BufferView extends MemoryView {
    private _buffer: Buffer;
    get buffer(): Buffer {
        return this._buffer;
    }

    constructor(private readonly _format: Format, usage: BufferUsageFlagBits, length: number = 0) {
        super(new format2array[_format](length), length);

        const info = new BufferInfo;
        info.usage = usage;
        info.size = this._source.byteLength;
        this._buffer = device.createBuffer(info);
    }

    public override reserve(capacity: number): MemoryView.TypedArray | null {
        if (this._source.length >= capacity) {
            return null;
        }
        const old = this._source;
        this._source = new format2array[this._format](capacity);
        return old;
    }

    protected override upload() {
        const bytes = this.length * this._source.BYTES_PER_ELEMENT;
        if (this._buffer.info.size < bytes) {
            this._buffer.resize(bytes);
        }
        this._buffer.update(this._source.buffer, 0, bytes);
    }
}