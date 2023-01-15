import Buffer, { BufferUsageFlagBits } from "../../gfx/Buffer.js";
import BufferView, { TypedArrayFormat } from "./BufferView.js";

const noop = function () { };

export default class BufferViewResizable {
    private _bufferView: BufferView = BufferView.Empty;

    private _data: any;
    get data(): { [n: number]: number } {
        return this._data as any;
    }

    private _length: number = 0;
    get length(): number {
        return this._length;
    }

    get buffer(): Buffer {
        return this._bufferView.buffer;
    }

    get BYTES_PER_ELEMENT(): number {
        return this._bufferView.BYTES_PER_ELEMENT
    }

    private _format: TypedArrayFormat;
    private _usage: BufferUsageFlagBits;
    private _onReallocate: (buffer: Buffer) => void;

    constructor(format: TypedArrayFormat, usage: BufferUsageFlagBits, onReallocate: (buffer: Buffer) => void = noop) {
        this._format = format;
        this._usage = usage;
        this._onReallocate = onReallocate;

        this._data = new Proxy(this, {
            get(target, p) {
                return Reflect.get(target._bufferView.data, p);
            },
            set(target, p, newValue) {
                return Reflect.set(target._bufferView.data, p, newValue);
            }
        })
    }

    reset(length: number) {
        this._length = length;
        if (this._bufferView.length >= length) {
            return;
        }
        this._bufferView = new BufferView(this._format, this._usage, length);
        this._onReallocate(this._bufferView.buffer);
    }

    resize(length: number) {
        this._length = length;
        if (this._bufferView.length >= length) {
            return;
        }
        this._bufferView = new BufferView(this._format, this._usage, length);
        this._bufferView.set(this._bufferView.data);
        this._onReallocate(this._bufferView.buffer);
    }

    shrink() {

    }

    set(array: ArrayLike<number>, offset?: number) {
        this._bufferView.set(array, offset);
    }

    update() {
        this._bufferView.update(this._length);
    }
}