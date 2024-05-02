import { AABB3D, aabb3d } from "../core/math/aabb3d.js";
import { Vec3, vec3 } from "../core/math/vec3.js";
import { Model } from "../core/render/scene/Model.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();
const vec3_c = vec3.create();
const vec3_d = vec3.create();

function contains(min: Readonly<Vec3>, max: Readonly<Vec3>, point: Readonly<Vec3>): boolean {
    return !(
        point[0] > max[0] || point[0] < min[0] ||
        point[1] > max[1] || point[1] < min[1] ||
        point[2] > max[2] || point[2] < min[2]
    );
}

function remove(models: Model[], model: Model) {
    const last = models.pop()!;
    if (last == model) {
        return;
    }

    models[models.indexOf(model)] = last;
}

export class ModelTreeNodeContext {
    readonly model2node: Map<Model, ModelTreeNode | null> = new Map;
}

/* children layout
        y
        |
        |_ _ _x
       /
     z/

     --------
     / 2  3 /
    / 6  7 /
    ---------
     / 0  1 /
    / 4  5 /
    --------
 **/
export class ModelTreeNode {
    private readonly _children: Map<number, ModelTreeNode> = new Map;
    public get children(): ReadonlyMap<number, ModelTreeNode> {
        return this._children;
    }

    private readonly _models: Model[] = [];
    public get models(): readonly Model[] {
        return this._models;
    }

    constructor(
        private readonly _context: ModelTreeNodeContext,
        public readonly bounds: Readonly<AABB3D>,
        private readonly _depth: number,
        private readonly _parent: ModelTreeNode | null = null,
        private readonly _index: number = -1
    ) { }

    update(model: Model) {
        if (this._depth < 8 - 1) {
            let child_index = 0;
            {
                const model_center = model.bounds.center;
                const node_center = this.bounds.center;
                child_index |= model_center[0] < node_center[0] ? 0 : 0x1;
                child_index |= model_center[1] < node_center[1] ? 0 : 0x2;
                child_index |= model_center[2] < node_center[2] ? 0 : 0x4;
            }

            const child_min = vec3_a;
            const child_max = vec3_b;
            aabb3d.toExtremes(child_min, child_max, this.bounds);

            if (child_index & 0x1) {
                child_min[0] = this.bounds.center[0]
            } else {
                child_max[0] = this.bounds.center[0]
            }

            if (child_index & 0x2) {
                child_min[1] = this.bounds.center[1]
            } else {
                child_max[1] = this.bounds.center[1]
            }

            if (child_index & 0x4) {
                child_min[2] = this.bounds.center[2]
            } else {
                child_max[2] = this.bounds.center[2]
            }

            const model_min = vec3_c;
            const model_max = vec3_d;
            aabb3d.toExtremes(model_min, model_max, model.bounds);
            if (contains(child_min, child_max, model_min) && contains(child_min, child_max, model_max)) {
                let child = this._children.get(child_index);
                if (!child) {
                    child = new ModelTreeNode(this._context, aabb3d.fromExtremes(aabb3d.create(), child_min, child_max), this._depth + 1, this, child_index);
                    this._children.set(child_index, child);
                }
                child.update(model);

                return;
            }
        }

        const last = this._context.model2node.get(model);
        if (last == this) {
            return;
        }

        if (last) {
            remove(last._models, model);
            if (last._models.length == 0 && last._children.size == 0) {
                last._parent?._children.delete(last._index);
            }
        }

        this._models.push(model);
        this._context.model2node.set(model, this);
    }

    *nodeIterator(): IterableIterator<ModelTreeNode> {
        yield this;
        for (const child of this._children.values()) {
            yield* child.nodeIterator();
        }
    }

    *modelIterator(): IterableIterator<Model> {
        for (const model of this._models) {
            yield model;
        }
        for (const child of this._children.values()) {
            yield* child.modelIterator();
        }
    }
}