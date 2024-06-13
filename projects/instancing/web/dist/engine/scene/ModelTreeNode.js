import { aabb3d } from "../core/math/aabb3d.js";
import { vec3 } from "../core/math/vec3.js";
const vec3_a = vec3.create();
const vec3_b = vec3.create();
const vec3_c = vec3.create();
const vec3_d = vec3.create();
function contains(min, max, point) {
    return !(point[0] > max[0] || point[0] < min[0] ||
        point[1] > max[1] || point[1] < min[1] ||
        point[2] > max[2] || point[2] < min[2]);
}
class Context {
    constructor(models) {
        this.model2node = new Map;
        const model2node = new Map;
        if (models) {
            for (const model of models) {
                model2node.set(model, null);
            }
        }
        this.model2node = model2node;
    }
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
    get children() {
        return this._children;
    }
    get models() {
        return this._models;
    }
    constructor(_context, bounds, _depth, _parent = null, _index = -1) {
        this._context = _context;
        this.bounds = bounds;
        this._depth = _depth;
        this._parent = _parent;
        this._index = _index;
        this._children = new Map;
        this._models = [];
    }
    update(model) {
        var _a;
        if (this._depth < 8 - 1) {
            const child_min = vec3_a;
            const child_max = vec3_b;
            // aabb3d.toExtremes(child_min, child_max, this.bounds);
            child_min[0] = this.bounds.center[0] - this.bounds.halfExtent[0];
            child_min[1] = this.bounds.center[1] - this.bounds.halfExtent[1];
            child_min[2] = this.bounds.center[2] - this.bounds.halfExtent[2];
            child_max[0] = this.bounds.center[0] + this.bounds.halfExtent[0];
            child_max[1] = this.bounds.center[1] + this.bounds.halfExtent[1];
            child_max[2] = this.bounds.center[2] + this.bounds.halfExtent[2];
            const node_bounds = model.bounds;
            let child_index = 0;
            if (node_bounds.center[0] < this.bounds.center[0]) {
                child_max[0] = this.bounds.center[0];
            }
            else {
                child_min[0] = this.bounds.center[0];
                child_index |= 0x1;
            }
            if (node_bounds.center[1] < this.bounds.center[1]) {
                child_max[1] = this.bounds.center[1];
            }
            else {
                child_min[1] = this.bounds.center[1];
                child_index |= 0x2;
            }
            if (node_bounds.center[2] < this.bounds.center[2]) {
                child_max[2] = this.bounds.center[2];
            }
            else {
                child_min[2] = this.bounds.center[2];
                child_index |= 0x4;
            }
            const model_min = vec3_c;
            const model_max = vec3_d;
            // aabb3d.toExtremes(model_min, model_max, node_bounds);
            model_min[0] = node_bounds.center[0] - node_bounds.halfExtent[0];
            model_min[1] = node_bounds.center[1] - node_bounds.halfExtent[1];
            model_min[2] = node_bounds.center[2] - node_bounds.halfExtent[2];
            model_max[0] = node_bounds.center[0] + node_bounds.halfExtent[0];
            model_max[1] = node_bounds.center[1] + node_bounds.halfExtent[1];
            model_max[2] = node_bounds.center[2] + node_bounds.halfExtent[2];
            if (contains(child_min, child_max, model_min) && contains(child_min, child_max, model_max)) {
                let child = this._children.get(child_index);
                if (!child) {
                    const center = vec3_c;
                    center[0] = (child_max[0] + child_min[0]) / 2;
                    center[1] = (child_max[1] + child_min[1]) / 2;
                    center[2] = (child_max[2] + child_min[2]) / 2;
                    const halfExtent = vec3_d;
                    halfExtent[0] = (child_max[0] - child_min[0]) / 2;
                    halfExtent[1] = (child_max[1] - child_min[1]) / 2;
                    halfExtent[2] = (child_max[2] - child_min[2]) / 2;
                    child = new ModelTreeNode(this._context, aabb3d.create(center, halfExtent), this._depth + 1, this, child_index);
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
        this._models.push(model);
        this._context.model2node.set(model, this);
        if (last) {
            // fast remove
            const one = last._models.pop();
            if (one != model) {
                last._models[last._models.indexOf(model)] = one;
            }
            let node = last;
            do {
                if (node._models.length) {
                    break;
                }
                if (node._children.size) {
                    break;
                }
                (_a = node._parent) === null || _a === void 0 ? void 0 : _a._children.delete(node._index);
            } while (node = node._parent);
        }
    }
    *nodeIterator() {
        yield this;
        for (const child of this._children.values()) {
            yield* child.nodeIterator();
        }
    }
    *modelIterator() {
        for (const model of this._models) {
            yield model;
        }
        for (const child of this._children.values()) {
            yield* child.modelIterator();
        }
    }
}
ModelTreeNode.Context = Context;
