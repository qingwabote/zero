import { device } from "boot";
import { Buffer, BufferInfo, BufferUsageFlagBits, CommandBuffer } from "gfx";
import { pk } from "puttyknife";
import { MemoryView } from "./MemoryView.js";

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

export class BufferView extends MemoryView {
    private _buffer: Buffer;
    get buffer(): Buffer {
        return this._buffer;
    }

    constructor(private readonly _format: keyof pk.ArrayTypes, usage: BufferUsageFlagBits, length: number = 0, capacity: number = 0) {
        const handle = pk.heap.newBuffer(Math.max(capacity, length) * format2bytes(_format), 0);
        const view = pk.heap.getBuffer(handle, _format, Math.max(capacity, length));
        super(handle, view, length);

        const info = new BufferInfo;
        info.usage = usage;
        info.size = view.byteLength;
        this._buffer = device.createBuffer(info);
    }

    public override reserve(capacity: number) {
        if (this._view.length >= capacity) {
            return null;
        }
        const old = { handle: this._handle, view: this._view };
        const source_handle = pk.heap.newBuffer(capacity * format2bytes(this._format), 0);
        this._view = pk.heap.getBuffer(source_handle, this._format, capacity);
        this._handle = source_handle;
        return old;
    }

    protected override upload(commandBuffer: CommandBuffer, offset: number, length: number) {
        const bytes = this.length * this._view.BYTES_PER_ELEMENT;
        if (this._buffer.info.size < bytes) {
            this._buffer.resize(bytes);
            offset = 0;
            length = this.length;
        }
        this._buffer.upload(this._view, offset, length, offset * this._view.BYTES_PER_ELEMENT);
    }
}