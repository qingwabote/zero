export class FrameChangeRecord {
    get hasChanged() {
        return this._frameId == FrameChangeRecord.frameId ? this._hasChanged : 0;
    }
    set hasChanged(flags) {
        this._frameId = FrameChangeRecord.frameId;
        this._hasChanged = flags;
    }
    constructor(_hasChanged = 0) {
        this._hasChanged = _hasChanged;
        this._frameId = FrameChangeRecord.frameId;
    }
}
FrameChangeRecord.frameId = 0;
