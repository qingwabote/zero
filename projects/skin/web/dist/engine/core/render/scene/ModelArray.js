import { cull } from "./culling.js";
export class ModelArray {
    constructor() {
        this._models = [];
    }
    add(model) {
        this._models.push(model);
    }
    cull(times = 1) {
        const claimed = times > 1 ? new Map : undefined;
        return (frustum, visibilities, type = 'default') => {
            return cull([], this._models, frustum, visibilities, type, claimed);
        };
    }
    update(model) { }
    [Symbol.iterator]() {
        return this._models.values();
    }
}
