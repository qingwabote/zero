import { device } from "boot";
import { Buffer, BufferInfo, BufferUsageFlagBits } from "gfx";
import { MemoryView } from "./MemoryView.js";

export class BufferView extends MemoryView {
    private _buffer: Buffer;
    get buffer(): Buffer {
        return this._buffer;
    }

    constructor(format: MemoryView.Format, usage: BufferUsageFlagBits, length: number = 0) {
        super(format, length);

        const info = new BufferInfo;
        info.usage = usage;
        info.size = this.source.byteLength;
        this._buffer = device.createBuffer(info);
    }

    upload(binary: ArrayBuffer, range: number) {
        if (this._buffer.info.size < range) {
            this._buffer.resize(range);
        }
        this._buffer.update(binary, 0, range);
    }
}