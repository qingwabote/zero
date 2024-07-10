import { Zero } from "../../Zero.js";
export class PeriodicFlag {
    get value() {
        if (this._version != Zero.frameCount) {
            return 0;
        }
        return this._value;
    }
    constructor(_value = 0) {
        this._value = _value;
        this._version = Zero.frameCount;
    }
    hasBit(bit) {
        if (this._version != Zero.frameCount) {
            return false;
        }
        return (this._value & bit) != 0;
    }
    addBit(bit) {
        this._value |= bit;
        this._version = Zero.frameCount;
    }
    removeBit(bit) {
        this._value &= ~bit;
        this._version = Zero.frameCount;
    }
    reset(value = 0) {
        this._value = value;
        this._version = Zero.frameCount;
    }
}
