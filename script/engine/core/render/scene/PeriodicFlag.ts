import { Zero } from "../../Zero.js";

interface PeriodicFlagReadonly<FlagBit extends number = number> {
    get value(): number;
    hasBit(bit: FlagBit): boolean;
    valueOf(): number;
}

export class PeriodicFlag<FlagBit extends number = number> implements PeriodicFlagReadonly<FlagBit> {
    private _version = Zero.frameCount;

    get value(): number {
        if (this._version != Zero.frameCount) {
            return 0;
        }
        return this._value;
    }

    constructor(private _value: number = 0) { }

    hasBit(bit: FlagBit): boolean {
        if (this._version != Zero.frameCount) {
            return false;
        }
        return (this._value & bit) != 0;
    }

    addBit(bit: FlagBit) {
        this._value |= bit;
        this._version = Zero.frameCount;
    }

    removeBit(bit: FlagBit) {
        this._value &= ~bit;
        this._version = Zero.frameCount;
    }

    reset(value: number = 0) {
        this._value = value;
        this._version = Zero.frameCount;
    }

    valueOf() {
        return this.value;
    }
}

export declare namespace PeriodicFlag {
    export { PeriodicFlagReadonly as Readonly }
}