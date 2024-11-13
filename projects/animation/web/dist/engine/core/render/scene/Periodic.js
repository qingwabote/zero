import { Zero } from "../../Zero.js";
export class Periodic {
    get value() {
        if (this._version != Zero.frameCount) {
            return this._default;
        }
        return this._value;
    }
    set value(val) {
        this._value = val;
        this._version = Zero.frameCount;
    }
    constructor(_value, _default) {
        this._value = _value;
        this._default = _default;
        this._version = Zero.frameCount;
    }
}
