import { device } from "boot";
import { Buffer, BufferInfo, BufferUsageFlagBits, CommandBuffer } from "gfx";
import { MemoryView } from "./MemoryView.js";

const format2array = {
    Uint16: Uint16Array,
    Uint32: Uint32Array,
    Float32: Float32Array
} as const

type Format = keyof typeof format2array;

export class BufferView extends MemoryView {
    private _buffer: Buffer;
    get buffer(): Buffer {
        return this._buffer;
    }

    constructor(private readonly _format: Format, usage: BufferUsageFlagBits, length: number = 0, capacity: number = 0) {
        const source = new format2array[_format](Math.max(capacity, length))
        super(source, length);

        const info = new BufferInfo;
        info.usage = usage;
        info.size = source.byteLength;
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

    protected override upload(commandBuffer: CommandBuffer, offset: number, length: number) {
        const bytes = this.length * this._source.BYTES_PER_ELEMENT;
        if (this._buffer.info.size < bytes) {
            this._buffer.resize(bytes);
            offset = 0;
            length = this.length;
        }
        this._buffer.update(this._source, offset, length, offset * this._source.BYTES_PER_ELEMENT);
    }
}