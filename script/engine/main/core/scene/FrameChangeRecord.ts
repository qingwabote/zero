export class FrameChangeRecord {
    static frameId = 0;

    private _frameId = 0;

    get hasChanged(): number {
        return this._frameId == FrameChangeRecord.frameId ? this._hasChanged : 0;
    }
    set hasChanged(flags: number) {
        this._frameId = FrameChangeRecord.frameId;
        this._hasChanged = flags;
    }

    constructor(private _hasChanged = 0) { }
}