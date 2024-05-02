import { Frustum } from "./Frustum.js";
import { Model } from "./Model.js";

export function cull(results: Model[], models: readonly Model[], type: string, visibilities: number, frustum: Readonly<Frustum>, claimed?: Map<Model, Model>) {
    for (const model of models) {
        if (model.type != type) {
            continue;
        }

        if ((visibilities & model.transform.visibility) == 0) {
            continue;
        }

        if (claimed?.has(model)) {
            continue;
        }

        if (frustum.aabb_out(model.bounds)) {
            continue;
        }

        if (claimed && frustum.aabb_in(model.bounds)) {
            claimed.set(model, model);
        }

        results.push(model);
    }
    return results;
}