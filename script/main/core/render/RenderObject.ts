export default class RenderObject {
    static frameId = 0;

    private _frameId = 0;

    private _hasChanged = 1;
    get hasChanged(): number {
        return this._frameId == RenderObject.frameId ? this._hasChanged : 0;
    }
    set hasChanged(flags: number) {
        this._frameId = RenderObject.frameId;
        this._hasChanged = flags;
    }
}