import { Model } from "../index.js";
import { Frustum } from "./Frustum.js";
import { ModelCollection } from "./ModelCollection.js";
import { cull } from "./culling.js";

export class ModelArray implements ModelCollection {

    private readonly _models: Model[] = [];

    add(model: Model): void {
        this._models.push(model);
    }

    cull(times = 1) {
        const claimed: Map<Model, Model> | undefined = times > 1 ? new Map : undefined;
        return (type: string, visibilities: number, frustum: Readonly<Frustum>) => {
            return cull([], this._models, type, visibilities, frustum, claimed);
        }
    }

    update(model: Model): void { }

    [Symbol.iterator]() {
        return this._models.values();
    }
}