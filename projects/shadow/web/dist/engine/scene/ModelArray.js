export class ModelArray {
    constructor() {
        this._models = [];
    }
    add(model) {
        this._models.push(model);
    }
    culler(times = 1) {
        throw new Error("Method not implemented.");
    }
    update() {
        throw new Error("Method not implemented.");
    }
    [Symbol.iterator]() {
        return this._models.values();
    }
}
