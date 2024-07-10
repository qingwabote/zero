import { Frustum } from "./Frustum.js";
import { Model } from "./Model.js";
import { ModelCollection } from "./ModelCollection.js";
import { cull } from "./culling.js";

export class ModelArray implements ModelCollection {

    private readonly _models: Model[];

    constructor(models?: Iterable<Model>) {
        this._models = models ? [...models] : [];
    }

    add(model: Model): void {
        this._models.push(model);
    }

    culler(times = 1) {
        const claimed: Map<Model, Model> | undefined = times > 1 ? new Map : undefined;
        return (results: Model[], frustum: Readonly<Frustum>, visibilities: number) => {
            cull(results, this._models, frustum, visibilities, claimed);
        }
    }

    update(model: Model): void { }

    [Symbol.iterator]() {
        return this._models.values();
    }
}