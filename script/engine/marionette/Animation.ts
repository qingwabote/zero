import { AnimationClip } from "../animating/AnimationClip.js";
import { AnimationState } from "../animating/AnimationState.js";
import { AnimationSystem } from "../animating/AnimationSystem.js";
import { ClipBinging } from "../animating/ClipBinging.js";
import { Component } from "../core/Component.js";
import { Solo } from "./sampler/Solo.js";

export class Animation extends Component {
    private _name2state: Record<string, AnimationState> = {};

    private _clips: readonly AnimationClip[] = [];
    public get clips(): readonly AnimationClip[] {
        return this._clips;
    }
    public set clips(value: readonly AnimationClip[]) {
        for (const clip of value) {
            this._name2state[clip.name] = new AnimationState(new Solo(new ClipBinging(clip, clip.channels.map(channel => this.node.getChildByPath(channel.node)!))));
        }
        this._clips = value;
    }

    play(name: string) {
        AnimationSystem.instance.addAnimation(this._name2state[name]);
    }

    getState(name: string): AnimationState {
        return this._name2state[name];
    }
}