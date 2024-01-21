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
        this._models.sort(modelCompareFn);
        for (const model of this._models) {
            model.update();
        }
    }
}
