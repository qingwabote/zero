import { Buffer, BufferUsageFlagBits } from "gfx-main";
import { EventEmitterImpl } from "../../../base/EventEmitterImpl.js";
import { BufferView } from "./BufferView.js";
import { BufferViewWritable, TypedArrayFormat } from "./BufferViewWritable.js";

export enum BufferViewResizableEventType {
    REALLOCATED = 'REALLOCATED'
}

export interface BufferViewResizableEventToListener {
    [BufferViewResizableEventType.REALLOCATED]: (buffer: Buffer) => void;
}

export class BufferViewResizable extends EventEmitterImpl<BufferViewResizableEventToListener> implements BufferView {
    private _bufferView: BufferViewWritable = BufferViewWritable.EMPTY;

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

    constructor(private _format: TypedArrayFormat, private _usage: BufferUsageFlagBits) {
        super();
        this._data = new Proxy(this, {
            get(target, p) {
                return Reflect.get(target._bufferView.data, p);
            },
            set(target, p, newValue) {
                return Reflect.set(target._bufferView.data, p, newValue);
            }
        })
    }

    /**
    * @returns true if the buffer is reallocated
    */
    reset(length: number): boolean {
        this._length = length;
        if (this._bufferView.length >= length) {
            return false;
        }
        this._bufferView = new BufferViewWritable(this._format, this._usage, length);
        this.emit(BufferViewResizableEventType.REALLOCATED, this._bufferView.buffer)
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
        this._bufferView = new BufferViewWritable(this._format, this._usage, length);
        this._bufferView.set(data);
        this.emit(BufferViewResizableEventType.REALLOCATED, this._bufferView.buffer)
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