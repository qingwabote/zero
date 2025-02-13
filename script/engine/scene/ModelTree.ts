import { AABB3D } from "../core/math/aabb3d.js";
import { Frustum } from "../core/render/scene/Frustum.js";
import { Model } from "../core/render/scene/Model.js";
import { ModelCollection } from "../core/render/scene/ModelCollection.js";
import * as culling from "../core/render/scene/culling.js";
import { ModelTreeNode } from "./ModelTreeNode.js";

function cull(results: Model[], node: ModelTreeNode, frustum: Readonly<Frustum>, visibilities: number, claimed?: Map<Model, Model>): Model[] {
    if (frustum.aabb_out(node.bounds)) {
        return results;
    }

    culling.cull(results, node.models, frustum, visibilities, claimed);

    for (const child of node.children.values()) {
        cull(results, child, frustum, visibilities, claimed);
    }

    return results;
}

export class ModelTree implements ModelCollection {
    readonly root: ModelTreeNode;

    private readonly _context: ModelTreeNode.Context;

    constructor(bounds: Readonly<AABB3D>, models?: Iterable<Model>) {
        this._context = new ModelTreeNode.Context(models);
        this.root = new ModelTreeNode(this._context, bounds, 0);
    }

    add(model: Model): void {
        this._context.model2node.set(model, null);
    }

    culler(distinct = false) {
        const claimed: Map<Model, Model> | undefined = distinct ? new Map : undefined;
        return (results: Model[], frustum: Readonly<Frustum>, visibilities: number) => {
            cull(results, this.root, frustum, visibilities, claimed);
        }
    }

    update(model: Model): void {
        this.root.update(model);
    }

    [Symbol.iterator](): Iterator<Model> {
        return this._context.model2node.keys();
    }
}