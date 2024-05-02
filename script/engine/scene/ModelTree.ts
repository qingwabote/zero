import { AABB3D } from "../core/math/aabb3d.js";
import { Frustum } from "../core/render/scene/Frustum.js";
import { Model } from "../core/render/scene/Model.js";
import { ModelCollection } from "../core/render/scene/ModelCollection.js";
import * as culling from "../core/render/scene/culling.js";
import { ModelTreeNode, ModelTreeNodeContext } from "./ModelTreeNode.js";

function cull(results: Model[], node: ModelTreeNode, type: string, visibilities: number, frustum: Readonly<Frustum>, claimed?: Map<Model, Model>): Model[] {
    if (frustum.aabb_out(node.bounds)) {
        return results;
    }

    culling.cull(results, node.models, type, visibilities, frustum, claimed);

    for (const child of node.children.values()) {
        cull(results, child, type, visibilities, frustum, claimed);
    }

    return results;
}

export class ModelTree implements ModelCollection {
    readonly root: ModelTreeNode;

    private readonly _context = new ModelTreeNodeContext;

    constructor(bounds: Readonly<AABB3D>) {
        this.root = new ModelTreeNode(this._context, bounds, 0);
    }

    add(model: Model): void {
        this._context.model2node.set(model, null);
    }

    cull(times = 1) {
        const claimed: Map<Model, Model> | undefined = times > 1 ? new Map : undefined;
        return (type: string, visibilities: number, frustum: Readonly<Frustum>) => {
            return cull([], this.root, type, visibilities, frustum, claimed);
        }
    }

    update(model: Model): void {
        this.root.update(model);
    }

    [Symbol.iterator](): Iterator<Model> {
        return this._context.model2node.keys();
    }
}