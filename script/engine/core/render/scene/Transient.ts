import { Zero } from "../../Zero.js";

export class Transient<T = number> {
    private _version = Zero.frameCount;

    get value(): T {
        if (this._version != Zero.frameCount) {
            return this._reset;
        }
        return this._value;
    }
    set value(val: T) {
        this._value = val;
        this._version = Zero.frameCount;
    }

    constructor(private _value: T, private readonly _reset: T) { }
}