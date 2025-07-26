import { Transient } from "../../../core/render/scene/Transient.js";

export class TransientPool<T> {
    private readonly _data: T[] = [];

    private _count: Transient = new Transient(0, 0);

    constructor(private readonly _creator: () => T) { }

    get(): T {
        if (this._count.value == this._data.length) {
            this._data.push(this._creator());
        }
        return this._data[this._count.value++];
    }
}