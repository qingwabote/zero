import { AnimationSystem } from "../animation/AnimationSystem.js";
import { AnimationClip } from "../assets/AnimationClip.js";
import { Component } from "../core/Component.js";
import { TRS } from "../core/math/TRS.js";
import { quat } from "../core/math/quat.js";
import { Vec3Like, vec3 } from "../core/math/vec3.js";
import { Vec4Like } from "../core/math/vec4.js";
import { Transform } from "../core/scene/Transform.js";
import { AnimationStateBlended, BlendContext } from "./internal/animation/AnimationStateBlended.js";
import { ClipBinging } from "./internal/animation/ClipBinging.js";

class BlendTRS implements TRS {
    private _position_default = vec3.create();
    private _position_weight: number = -1;
    private _position = vec3.create();
    public get position(): Readonly<Vec3Like> {
        return this._position;
    }
    public set position(value: Readonly<Vec3Like>) {
        this.blendPosition(value, this._context.weight)
    }

    private _rotation_default = quat.create();
    private _rotation_weight: number = -1;
    private _rotation = quat.create();
    public get rotation(): Readonly<Vec4Like> {
        return this._rotation;
    }
    public set rotation(value: Readonly<Vec4Like>) {
        this.blendRotation(value, this._context.weight)
    }

    private _scale_default = vec3.create();
    private _scale_weight: number = -1;
    private _scale = vec3.create();
    public get scale(): Readonly<Vec3Like> {
        return this._scale;
    }
    public set scale(value: Readonly<Vec3Like>) {
        this.blendScale(value, this._context.weight)
    }

    constructor(position: Readonly<Vec3Like>, rotation: Readonly<Vec4Like>, scale: Readonly<Vec3Like>, private _context: Readonly<BlendContext>) {
        vec3.copy(this._position_default, position);
        quat.copy(this._rotation_default, rotation);
        vec3.copy(this._scale_default, scale);

        // vec3.copy(this._position, this._position_default);
        // quat.copy(this._rotation, this._rotation_default);
        // vec3.copy(this._scale, this._scale_default);
    }

    private blendPosition(value: Readonly<Vec3Like>, weight: number) {
        if (this._position_weight == -1) {
            vec3.copy(this._position, value);
            this._position_weight = weight;
            return;
        }
        this._position_weight += weight;
        vec3.lerp(this._position, this._position, value, weight / this._position_weight);
    }

    private blendRotation(value: Readonly<Vec4Like>, weight: number) {
        if (this._rotation_weight == -1) {
            quat.copy(this._rotation, value);
            this._rotation_weight = weight;
            return;
        }
        this._rotation_weight += weight;
        quat.slerp(this._rotation, this._rotation, value, weight / this._rotation_weight);
    }

    private blendScale(value: Readonly<Vec3Like>, weight: number) {
        if (this._scale_weight == -1) {
            vec3.copy(this._scale, value);
            this._scale_weight = weight;
            return;
        }
        this._scale_weight += weight;
        vec3.lerp(this._scale, this._scale, value, weight / this._scale_weight);
    }

    flush(out: TRS) {
        if (this._position_weight != -1) {
            if (this._position_weight < 1) {
                this.blendPosition(this._position_default, 1 - this._position_weight)
            }

            out.position = this._position;
            // vec3.copy(this._position, this._position_default);
            this._position_weight = -1;
        }

        if (this._rotation_weight != -1) {
            if (this._rotation_weight < 1) {
                this.blendRotation(this._rotation_default, 1 - this._rotation_weight)
            }

            out.rotation = this._rotation;
            // quat.copy(this._rotation, this._rotation_default);
            this._rotation_weight = -1;
        }

        if (this._scale_weight != -1) {
            if (this._scale_weight < 1) {
                this.blendScale(this._scale_default, 1 - this._scale_weight)
            }

            out.scale = this._scale;
            // vec3.copy(this._scale, this._scale_default);
            this._scale_weight = -1;
        }
    }
}

class BlendContextImpl implements BlendContext {
    weight: number = 0;

    private _node2trs: Map<Transform, BlendTRS> = new Map;

    constructor(private _root: Transform) { }

    getTRS(path: readonly string[]): TRS {
        const child = this._root.getChildByPath(path)!;
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

export class AnimationBlended extends Component {
    clips: readonly AnimationClip[] = [];

    thresholds: readonly number[] = [];

    private _inputChanged = true;
    private _input: number = 0;
    public get input(): number {
        return this._input;
    }
    public set input(value: number) {
        this._input = value;
        this._inputChanged = true;
    }

    private _state!: AnimationStateBlended;
    public get state(): AnimationStateBlended {
        return this._state;
    }

    override start(): void {
        const context = new BlendContextImpl(this.node);
        const clips: ClipBinging[] = [];
        for (const clip of this.clips) {
            clips.push(new ClipBinging(clip, path => context.getTRS(path)));
        }
        const state = new AnimationStateBlended(clips, this.thresholds, context);
        AnimationSystem.instance.addAnimation(state);
        this._state = state;
    }

    override update(): void {
        if (this._inputChanged) {
            this._state.input = this._input;
            this._inputChanged = false;
        }
    }
}