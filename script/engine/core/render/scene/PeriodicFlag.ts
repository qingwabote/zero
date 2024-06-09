let version = 0;

export class PeriodicFlag {
    static expire() { version++; }

    private _version = version;

    get value(): number {
        if (this._version != version) {
            return 0;
        }
        return this._value;
    }

    constructor(private _value: number = 0) { }

    hasBit(bit: number): boolean {
        if (this._version != version) {
            return false;
        }
        return (this._value & bit) != 0;
    }

    addBit(bit: number) {
        this._value |= bit;
        this._version = version;
    }

    removeBit(bit: number) {
        this._value &= ~bit;
        this._version = version;
    }

    clear(value: number = 0) {
        this._value = value;
        this._version = version;
    }
}