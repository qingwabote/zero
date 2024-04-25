let version = 0;

export class ChangeRecord {
    static expire() { version++; }

    private _version = version;

    get hasChanged(): number {
        return this._version == version ? this._hasChanged : 0;
    }
    set hasChanged(flags: number) {
        this._hasChanged = flags;
        this._version = version;
    }

    constructor(private _hasChanged = 0) { }
}