import { Model } from "../index.js";
import { Frustum } from "./Frustum.js";
import { ModelCollection } from "./ModelCollection.js";

export class ModelArray implements ModelCollection {

    private readonly _models: Model[] = [];

    add(model: Model): void {
        this._models.push(model);
    }

    cull(times = 1) {
        const claimed: Map<Model, Model> | undefined = times > 1 ? new Map : undefined;
        return (type: string, visibilities: number, frustum: Readonly<Frustum>) => {
            const res: Model[] = [];
            for (const model of this._models) {
                if (model.type != type) {
                    continue;
                }

                if ((visibilities & model.transform.visibility) == 0) {
                    continue;
                }

                if (claimed?.has(model)) {
                    continue;
                }

                if (frustum.aabb_out(model.world_bounds)) {
                    continue;
                }

                if (claimed && frustum.aabb_in(model.world_bounds)) {
                    claimed.set(model, model);
                }

                res.push(model);
            }
            return res;
        }
    }

    update(): void {
        for (const model of this._models) {
            model.update();
        }
    }

    [Symbol.iterator]() {
        return this._models.values();
    }
}