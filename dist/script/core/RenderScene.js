export default class RenderScene {
    _models = [];
    get models() {
        return this._models;
    }
    update(dt) {
        for (const model of this._models) {
            model.update();
        }
    }
}
//# sourceMappingURL=RenderScene.js.map