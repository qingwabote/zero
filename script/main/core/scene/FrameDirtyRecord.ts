export default class FrameDirtyRecord {
    static frameId = 0;

    private _frameId = 0;

    private _hasChanged = 0;
    get hasChanged(): number {
        return this._frameId == FrameDirtyRecord.frameId ? this._hasChanged : 0;
    }
    set hasChanged(flags: number) {
        this._frameId = FrameDirtyRecord.frameId;
        this._hasChanged = flags;
    }
}