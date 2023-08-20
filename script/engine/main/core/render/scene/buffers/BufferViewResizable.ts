import { Buffer, BufferUsageFlagBits } from "gfx-main";
import { BufferView } from "./BufferView.js";
import { BufferViewWritable, TypedArrayFormat } from "./BufferViewWritable.js";

export class BufferViewResizable implements BufferView {
    private _bufferView: BufferViewWritable;

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

    constructor(format: TypedArrayFormat, usage: BufferUsageFlagBits) {
        this._data = new Proxy(this, {
            get(target, p) {
                return Reflect.get(target._bufferView.data, p);
            },
            set(target, p, newValue) {
                return Reflect.set(target._bufferView.data, p, newValue);
            }
        })
        this._bufferView = new BufferViewWritable(format, usage, 0);
    }

    /**
    * @returns true if the buffer is reallocated
    */
    reset(length: number): boolean {
        this._length = length;
        if (this._bufferView.length >= length) {
            return false;
        }
        this._bufferView.resize(length)
        return true;
    }

    /**
     * @returns true if the buffer is reallocated
     */
    resize(length: number): boolean {
        this._length = length;
        if (this._bufferView.length >= length) {
            return false;
        }
        const data = this._bufferView.data;
        this._bufferView.resize(length);
        this._bufferView.set(data);
        return true;
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