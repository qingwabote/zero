import * as culling from "../core/render/scene/culling.js";
import { ModelTreeNode } from "./ModelTreeNode.js";
function cull(results, node, frustum, visibilities, claimed) {
    if (frustum.aabb_out(node.bounds)) {
        return results;
    }
    culling.cull(results, node.models, frustum, visibilities, claimed);
    for (const child of node.children.values()) {
        cull(results, child, frustum, visibilities, claimed);
    }
    return results;
}
export class ModelTree {
    constructor(bounds, models) {
        this._context = new ModelTreeNode.Context(models);
        this.root = new ModelTreeNode(this._context, bounds, 0);
    }
    add(model) {
        this._context.model2node.set(model, null);
    }
    culler(distinct = false) {
        const claimed = distinct ? new Map : undefined;
        return (results, frustum, visibilities) => {
            cull(results, this.root, frustum, visibilities, claimed);
        };
    }
    update(model) {
        this.root.update(model);
    }
    [Symbol.iterator]() {
        return this._context.model2node.keys();
    }
}
