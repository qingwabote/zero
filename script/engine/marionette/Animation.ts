import { AnimationClip } from "../animating/AnimationClip.js";
import { AnimationClipInstance } from "../animating/AnimationClipInstance.js";
import { AnimationSampler } from "../animating/AnimationSampler.js";
import { AnimationState } from "../animating/AnimationState.js";
import { AnimationSystem } from "../animating/AnimationSystem.js";
import { Component } from "../core/Component.js";

export class Animation extends Component implements AnimationSampler {
    protected readonly _instances: AnimationClipInstance[] = [];
    private _clips: readonly AnimationClip[] = [];
    public get clips(): readonly AnimationClip[] {
        return this._clips;
    }
    public set clips(value: readonly AnimationClip[]) {
        this._instances.length = 0;
        for (const clip of value) {
            this._instances.push(new AnimationClipInstance(clip, clip.channels.map(channel => this.node.getChildByPath(channel.node)!)));
        }
        this._clips = value;
    }

    private _index = -1;
    public get index() {
        return this._index;
    }

    public get duration(): number {
        return this._instances[this._index].duration;
    }

    private readonly _state = new AnimationState(this);

    play(index: number) {
        this._index = index;
        AnimationSystem.instance.addAnimation(this._state);
    }

    public sample(time: number) {
        this._instances[this._index].sample(time);
    }
}