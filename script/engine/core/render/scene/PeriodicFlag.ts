import { Zero } from "../../Zero.js";

interface PeriodicFlagReadonly<FlagBit extends number = number> {
    get value(): number;
    hasBit(bit: FlagBit): boolean;
}

export class PeriodicFlag<FlagBit extends number = number> implements PeriodicFlagReadonly<FlagBit> {
    private _version = Zero.frameCount;

    get value(): number {
        if (this._version != Zero.frameCount) {
            return 0;
        }
        return this._value;
    }
    set value(val: number) {
        this._value = val;
        this._version = Zero.frameCount;
    }

    constructor(private _value: number = 0) { }

    hasBit(bit: FlagBit): boolean {
        return (this.value & bit) != 0;
    }

    addBit(bit: FlagBit) {
        this.value |= bit;
    }

    removeBit(bit: FlagBit) {
        this.value &= ~bit;
    }
}

export declare namespace PeriodicFlag {
    export { PeriodicFlagReadonly as Readonly }
}