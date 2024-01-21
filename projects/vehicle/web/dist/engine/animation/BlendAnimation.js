import { Component } from "../core/Component.js";
import { quat } from "../core/math/quat.js";
import { vec3 } from "../core/math/vec3.js";
import { AnimationStateBlended } from "./internal/AnimationStateBlended.js";
import { AnimationSystem } from "./internal/AnimationSystem.js";
import { ClipBinging } from "./internal/ClipBinging.js";
class BlendTRS {
    get position() {
        return this._position;
    }
    set position(value) {
        this.blendPosition(value, this._context.weight);
    }
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        this.blendRotation(value, this._context.weight);
    }
    get scale() {
        return this._scale;
    }
    set scale(value) {
        this.blendScale(value, this._context.weight);
    }
    constructor(position, rotation, scale, _context) {
        this._context = _context;
        this._position_default = vec3.create();
        this._position_weight = -1;
        this._position = vec3.create();
        this._rotation_default = quat.create();
        this._rotation_weight = -1;
        this._rotation = quat.create();
        this._scale_default = vec3.create();
        this._scale_weight = -1;
        this._scale = vec3.create();
        vec3.copy(this._position_default, position);
        quat.copy(this._rotation_default, rotation);
        vec3.copy(this._scale_default, scale);
        // vec3.copy(this._position, this._position_default);
        // quat.copy(this._rotation, this._rotation_default);
        // vec3.copy(this._scale, this._scale_default);
    }
    blendPosition(value, weight) {
        if (this._position_weight == -1) {
            vec3.copy(this._position, value);
            this._position_weight = weight;
            return;
        }
        this._position_weight += weight;
        vec3.lerp(this._position, this._position, value, weight / this._position_weight);
    }
    blendRotation(value, weight) {
        if (this._rotation_weight == -1) {
            quat.copy(this._rotation, value);
            this._rotation_weight = weight;
            return;
        }
        this._rotation_weight += weight;
        quat.slerp(this._rotation, this._rotation, value, weight / this._rotation_weight);
    }
    blendScale(value, weight) {
        if (this._scale_weight == -1) {
            vec3.copy(this._scale, value);
            this._scale_weight = weight;
            return;
        }
        this._scale_weight += weight;
        vec3.lerp(this._scale, this._scale, value, weight / this._scale_weight);
    }
    flush(out) {
        if (this._position_weight != -1) {
            if (this._position_weight < 1) {
                this.blendPosition(this._position_default, 1 - this._position_weight);
            }
            out.position = this._position;
            // vec3.copy(this._position, this._position_default);
            this._position_weight = -1;
        }
        if (this._rotation_weight != -1) {
            if (this._rotation_weight < 1) {
                this.blendRotation(this._rotation_default, 1 - this._rotation_weight);
            }
            out.rotation = this._rotation;
            // quat.copy(this._rotation, this._rotation_default);
            this._rotation_weight = -1;
        }
        if (this._scale_weight != -1) {
            if (this._scale_weight < 1) {
                this.blendScale(this._scale_default, 1 - this._scale_weight);
            }
            out.scale = this._scale;
            // vec3.copy(this._scale, this._scale_default);
            this._scale_weight = -1;
        }
    }
}
class BlendContextImpl {
    constructor(_root) {
        this._root = _root;
        this.weight = 0;
        this._node2trs = new Map;
    }
    getTRS(path) {
        const child = this._root.getChildByPath(path);
        let trs = this._node2trs.get(child);
        if (!trs) {
            trs = new BlendTRS(child.position, child.rotation, child.scale, this);
            this._node2trs.set(child, trs);
        }
        return trs;
    }
    flush() {
        for (const [node, trs] of this._node2trs) {
            trs.flush(node);
        }
    }
}
export class BlendAnimation extends Component {
    constructor() {
        super(...arguments);
        this.clips = [];
        this.thresholds = [];
        this._inputChanged = true;
        this._input = 0;
    }
    get input() {
        return this._input;
    }
    set input(value) {
        this._input = value;
        this._inputChanged = true;
    }
    get state() {
        return this._state;
    }
    start() {
        const context = new BlendContextImpl(this.node);
        const clips = [];
        for (const clip of this.clips) {
            clips.push(new ClipBinging(clip, path => context.getTRS(path)));
        }
        const state = new AnimationStateBlended(clips, this.thresholds, context);
        AnimationSystem.instance.addAnimation(state);
        this._state = state;
    }
    update() {
        if (this._inputChanged) {
            this._state.input = this._input;
            this._inputChanged = false;
        }
    }
}
