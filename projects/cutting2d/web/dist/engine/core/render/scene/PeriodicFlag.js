let version = 0;
export class PeriodicFlag {
    static expire() { version++; }
    get value() {
        if (this._version != version) {
            return 0;
        }
        return this._value;
    }
    constructor(_value = 0) {
        this._value = _value;
        this._version = version;
    }
    hasBit(bit) {
        if (this._version != version) {
            return false;
        }
        return (this._value & bit) != 0;
    }
    addBit(bit) {
        this._value |= bit;
        this._version = version;
    }
    removeBit(bit) {
        this._value &= ~bit;
        this._version = version;
    }
    reset(value = 0) {
        this._value = value;
        this._version = version;
    }
}
