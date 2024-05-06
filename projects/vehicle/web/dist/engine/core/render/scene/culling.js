export function cull(results, models, frustum, visibilities, type, claimed) {
    for (const model of models) {
        if (model.type != type) {
            continue;
        }
        if ((visibilities & model.transform.visibility) == 0) {
            continue;
        }
        if (claimed === null || claimed === void 0 ? void 0 : claimed.has(model)) {
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
