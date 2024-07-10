import { cull } from "./culling.js";
export class ModelArray {
    constructor(models) {
        this._models = models ? [...models] : [];
    }
    add(model) {
        this._models.push(model);
    }
    culler(times = 1) {
        const claimed = times > 1 ? new Map : undefined;
        return (results, frustum, visibilities) => {
            cull(results, this._models, frustum, visibilities, claimed);
        };
    }
    update(model) { }
    [Symbol.iterator]() {
        return this._models.values();
    }
}
