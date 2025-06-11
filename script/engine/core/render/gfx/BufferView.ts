import { device } from "boot";
import { Buffer, BufferInfo, BufferUsageFlagBits, CommandBuffer } from "gfx";
import { pk } from "puttyknife";
import { MemoryView } from "./MemoryView.js";

export class BufferView extends MemoryView {
    private _buffer: Buffer;
    get buffer(): Buffer {
        return this._buffer;
    }

    constructor(format: keyof pk.ArrayTypes, usage: BufferUsageFlagBits, length: number = 0) {
        super(format, length);

        const info = new BufferInfo;
        info.usage = usage;
        info.size = this._source.byteLength;
        this._buffer = device.createBuffer(info);
    }

    protected override upload(commandBuffer: CommandBuffer, offset: number, length: number) {
        const bytes = this.length * this._source.BYTES_PER_ELEMENT;
        if (this._buffer.info.size < bytes) {
            this._buffer.resize(bytes);
            offset = 0;
            length = this.length;
        }
        this._buffer.upload(this._source, offset, length, offset * this._source.BYTES_PER_ELEMENT);
    }
}