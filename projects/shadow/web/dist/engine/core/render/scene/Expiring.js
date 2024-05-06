let version = 0;
export class Expiring {
    static expire() { version++; }
    get value() {
        return this._version == version ? this._value : 0;
    }
    set value(value) {
        this._value = value;
        this._version = version;
    }
    constructor(_value = 0) {
        this._value = _value;
        this._version = version;
    }
}
