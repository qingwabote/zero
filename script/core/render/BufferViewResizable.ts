import Buffer, { BufferUsageFlagBits } from "../gfx/Buffer.js";
import BufferView, { TypedArray, TypedArrayFormat } from "./BufferView.js";

const noop = function () { };

export default class BufferViewResizable {
    private _bufferView: BufferView = BufferView.Empty;

    get data(): TypedArray {
        return this._bufferView.data;
    }

    get buffer(): Buffer {
        return this._bufferView.buffer;
    }

    private _format: TypedArrayFormat;
    private _usage: BufferUsageFlagBits;
    private _onReallocate: (buffer: Buffer) => void;

    constructor(format: TypedArrayFormat, usage: BufferUsageFlagBits, onReallocate: (buffer: Buffer) => void = noop) {
        this._format = format;
        this._usage = usage;
        this._onReallocate = onReallocate;
    }

    reset(length: number) {
        if (this._bufferView.length >= length) {
            return;
        }
        this._bufferView = new BufferView(this._format, this._usage, length);
        this._onReallocate(this._bufferView.buffer);
    }

    resize(length: number) {
        if (this._bufferView.length >= length) {
            return;
        }
        const data = this._bufferView.data;
        this._bufferView = new BufferView(this._format, this._usage, length);
        this._bufferView.set(data);
        this._onReallocate(this._bufferView.buffer);
    }

    shrink() {

    }

    set(array: ArrayLike<number>, offset?: number) {
        this._bufferView.set(array, offset);
    }

    update() {
        this._bufferView.update();
    }
}