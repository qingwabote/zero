export class RenderPass {
    get info() {
        return this._info;
    }
    initialize(info) {
        this._info = info;
        return false;
    }
}