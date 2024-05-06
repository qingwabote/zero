let version = 0;
export class ChangeRecord {
    static expire() { version++; }
    get hasChanged() {
        return this._version == version ? this._hasChanged : 0;
    }
    set hasChanged(flags) {
        this._hasChanged = flags;
        this._version = version;
    }
    constructor(_hasChanged = 0) {
        this._hasChanged = _hasChanged;
        this._version = version;
    }
}
