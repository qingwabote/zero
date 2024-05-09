import * as culling from "../core/render/scene/culling.js";
import { ModelTreeNode, ModelTreeNodeContext } from "./ModelTreeNode.js";
function cull(results, node, frustum, visibilities, type, claimed) {
    if (frustum.aabb_out(node.bounds)) {
        return results;
    }
    culling.cull(results, node.models, frustum, visibilities, type, claimed);
    for (const child of node.children.values()) {
        cull(results, child, frustum, visibilities, type, claimed);
    }
    return results;
}
export class ModelTree {
    constructor(bounds, models) {
        this._context = new ModelTreeNodeContext(models);
        this.root = new ModelTreeNode(this._context, bounds, 0);
    }
    add(model) {
        this._context.model2node.set(model, null);
    }
    cull(times = 1) {
        const claimed = times > 1 ? new Map : undefined;
        return (frustum, visibilities, type = 'default') => {
            return cull([], this.root, frustum, visibilities, type, claimed);
        };
    }
    update(model) {
        this.root.update(model);
    }
    [Symbol.iterator]() {
        return this._context.model2node.keys();
    }
}
