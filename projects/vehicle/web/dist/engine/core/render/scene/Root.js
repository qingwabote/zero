function modelCompareFn(a, b) {
    return a.order - b.order;
}
export class Root {
    constructor() {
        this.directionalLight = undefined;
        this._cameras = [];
        this._models = [];
    }
    get cameras() {
        return this._cameras;
    }
    get models() {
        return this._models;
    }
    addModel(model) {
        this._models.push(model);
        model.onAddToScene();
    }
    update() {
        var _a;
        for (const camera of this._cameras) {
            camera.update();
        }
        (_a = this.directionalLight) === null || _a === void 0 ? void 0 : _a.update();
        this._models.sort(modelCompareFn);
        for (const model of this._models) {
            model.update();
        }
    }
}
