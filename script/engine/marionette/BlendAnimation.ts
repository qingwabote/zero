import { AnimationClip } from "../animating/AnimationClip.js";
import { AnimationClipInstance } from "../animating/AnimationClipInstance.js";
import { AnimationSampler } from "../animating/AnimationSampler.js";
import { AnimationState } from "../animating/AnimationState.js";
import { AnimationSystem } from "../animating/AnimationSystem.js";
import { Component } from "../core/Component.js";
import { quat } from "../core/math/quat.js";
import { TRS } from "../core/math/TRS.js";
import { vec3, Vec3Like } from "../core/math/vec3.js";
import { Vec4Like } from "../core/math/vec4.js";

interface Context {
    weight: number;
}

class Blender implements TRS {
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

    constructor(private readonly _target: TRS, private _context: Readonly<Context>) {
        vec3.copy(this._position_default, _target.position);
        quat.copy(this._rotation_default, _target.rotation);
        vec3.copy(this._scale_default, _target.scale);

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

    flush() {
        if (this._position_weight != -1) {
            if (this._position_weight < 1) {
                this.blendPosition(this._position_default, 1 - this._position_weight)
            }

            this._target.position = this._position;
            // vec3.copy(this._position, this._position_default);
            this._position_weight = -1;
        }

        if (this._rotation_weight != -1) {
            if (this._rotation_weight < 1) {
                this.blendRotation(this._rotation_default, 1 - this._rotation_weight)
            }

            this._target.rotation = this._rotation;
            // quat.copy(this._rotation, this._rotation_default);
            this._rotation_weight = -1;
        }

        if (this._scale_weight != -1) {
            if (this._scale_weight < 1) {
                this.blendScale(this._scale_default, 1 - this._scale_weight)
            }

            this._target.scale = this._scale;
            // vec3.copy(this._scale, this._scale_default);
            this._scale_weight = -1;
        }
    }
}

export class BlendAnimation extends Component implements AnimationSampler {
    private _weights: number[] = [];
    public get weights(): readonly number[] {
        return this._weights;
    }

    private readonly _blenders: Map<TRS, Blender> = new Map();
    private readonly _instances: AnimationClipInstance[] = [];
    private _clips: readonly AnimationClip[] = [];
    public get clips(): readonly AnimationClip[] {
        return this._clips;
    }
    public set clips(value: readonly AnimationClip[]) {
        this._instances.length = 0;
        for (const clip of value) {
            this._instances.push(new AnimationClipInstance(clip, clip.channels.map((channel) => {
                const node = this.node.getChildByPath(channel.node)!
                let blender = this._blenders.get(node);
                if (!blender) {
                    this._blenders.set(node, blender = new Blender(node, this._context));
                }
                return blender;
            })));
        }
        this._weights.length = value.length;

        this._clips = value;
    }

    public get duration(): number {
        let duration = 0;
        for (let i = 0; i < this._instances.length; i++) {
            duration += this._instances[i].duration * this._weights[i];
        }
        return duration;
    }

    thresholds: readonly number[] = [];

    private _input: number = 0;
    public get input(): number {
        return this._input;
    }
    public set input(value: number) {
        this._input = value;
        this.updateWeights();
    }

    private readonly _context: Context = { weight: 0 };

    private readonly _state = new AnimationState(this);

    override start(): void {
        AnimationSystem.instance.addAnimation(this._state);
    }

    public sample(time: number) {
        const progress = time / this.duration;

        for (let i = 0; i < this._instances.length; i++) {
            const clip = this._instances[i];
            const weight = this._weights[i];
            if (!weight) {
                continue;
            }
            this._context.weight = weight;
            clip.sample(clip.duration * progress);
        }

        for (const blender of this._blenders.values()) {
            blender.flush();
        }
    }

    private updateWeights(): void {
        const { _weights: weights, thresholds: thresholds, _input: input } = this;

        weights.fill(0);
        if (input <= thresholds[0]) {
            weights[0] = 1;
        } else if (input >= thresholds[thresholds.length - 1]) {
            weights[weights.length - 1] = 1;
        } else {
            let iGreater = thresholds.findIndex(value => value > input);
            const greater = thresholds[iGreater];
            const smaller = thresholds[iGreater - 1];
            const d = greater - smaller;
            weights[iGreater] = (input - smaller) / d;
            weights[iGreater - 1] = (greater - input) / d;
        }
    }
}