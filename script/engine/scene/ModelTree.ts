import { AABB3D } from "../core/math/aabb3d.js";
import { Frustum } from "../core/render/scene/Frustum.js";
import { Model } from "../core/render/scene/Model.js";
import { ModelCollection } from "../core/render/scene/ModelCollection.js";
import { ModelTreeNode, ModelTreeNodeContext } from "./ModelTreeNode.js";

function cull(frustum: Readonly<Frustum>, node: ModelTreeNode, results: Model[], claimed?: Map<Model, Model>) {
    if (frustum.aabb_out(node.bounds)) {
        return;
    }

    for (const model of node.models) {
        if (claimed?.has(model)) {
            continue;
        }

        if (frustum.aabb_out(model.world_bounds)) {
            continue;
        }

        if (claimed && frustum.aabb_in(model.world_bounds)) {
            claimed.set(model, model);
        }

        results.push(model);
    }

    for (const child of node.children.values()) {
        cull(frustum, child, results, claimed);
    }
}

export class ModelTree implements ModelCollection {
    readonly root: ModelTreeNode;

    private readonly _context = new ModelTreeNodeContext;

    constructor(bounds: Readonly<AABB3D>) {
        this.root = new ModelTreeNode(this._context, bounds, 0);
    }

    [Symbol.iterator](): Iterator<Model> {
        return this._context.model2node.keys();
    }

    add(model: Model): void {
        this.root.swallow(model);
    }

    cull(times = 1): (frustum: Readonly<Frustum>) => Model[] {
        const claimed: Map<Model, Model> | undefined = times > 1 ? new Map : undefined;
        return (frustum: Readonly<Frustum>) => {
            const res: Model[] = [];
            cull(frustum, this.root, res, claimed);
            return res;
        }
    }

    update(): void {
        for (const model of this._context.model2node.keys()) {

            model.update();

            if (model.hasChanged) {
                this.root.swallow(model);
            }
        }
    }
}