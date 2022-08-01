export default class RenderScene {
    _cameras = [];
    get cameras() {
        return this._cameras;
    }
    _models = [];
    get models() {
        return this._models;
    }
    update(dt) {
        for (let i = 0; i < this._cameras.length; i++) {
            this._cameras[i].update();
        }
        for (let i = 0; i < this._models.length; i++) {
            this._models[i].update();
        }
    }
}
//# sourceMappingURL=RenderScene.js.map