import { AnimationClip } from "../animating/AnimationClip.js";
import { AnimationState } from "../animating/AnimationState.js";
import { AnimationSystem } from "../animating/AnimationSystem.js";
import { Component } from "../core/Component.js";
import { Blend } from "./sampler/Blend.js";

export class BlendAnimation extends Component {
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

    private _sampler!: Blend;
    public get weights() {
        return this._sampler.weights;
    }

    override start(): void {
        const sampler = new Blend(this.node, this.clips, this.thresholds);
        AnimationSystem.instance.addAnimation(new AnimationState(sampler));
        this._sampler = sampler;
    }

    override update(): void {
        if (this._inputChanged) {
            this._sampler.input = this._input;
            this._inputChanged = false;
        }
    }
}