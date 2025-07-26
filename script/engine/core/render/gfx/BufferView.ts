import { device } from "boot";
import { Buffer, BufferInfo, BufferUsageFlagBits, CommandBuffer } from "gfx";
import { pk } from "puttyknife";
import { MemoryView } from "./MemoryView.js";

export class BufferView extends MemoryView {
    readonly buffer: Buffer;

    constructor(format: keyof pk.ArrayTypes, usage: BufferUsageFlagBits, length: number = 0, capacity: number = 0) {
        super(format, length, capacity);

        const info = new BufferInfo;
        info.usage = usage;
        info.size = this._source.byteLength;
        this.buffer = device.createBuffer(info);
    }

    protected override upload(commandBuffer: CommandBuffer, offset: number, length: number) {
        const size_old = this.buffer.info.size;
        const size_new = this.length * this._source.BYTES_PER_ELEMENT;
        if (this.buffer.info.size < size_new) {
            this.buffer.resize(size_new);
            length = Math.max(size_old / this._source.BYTES_PER_ELEMENT, offset + length);
            offset = 0;
        }
        this.buffer.upload(this._source, offset, length, offset * this._source.BYTES_PER_ELEMENT);
    }
}