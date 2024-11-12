import { AnimationClip } from "../animating/AnimationClip.js";
import { AnimationSystem } from "../animating/AnimationSystem.js";
import { ClipBinging } from "../animating/ClipBinging.js";
import { Component } from "../core/Component.js";
import { AnimationStateSingle } from "./internal/AnimationStateSingle.js";

export class Animation extends Component {
    private _name2state: Record<string, AnimationStateSingle> = {};

    private _clips: readonly AnimationClip[] = [];
    public get clips(): readonly AnimationClip[] {
        return this._clips;
    }
    public set clips(value: readonly AnimationClip[]) {
        for (const clip of value) {
            this._name2state[clip.name] = new AnimationStateSingle(new ClipBinging(clip, path => this.node.getChildByPath(path)!));
        }
        this._clips = value;
    }

    play(name: string) {
        AnimationSystem.instance.addAnimation(this._name2state[name]);
    }

    getState(name: string): AnimationStateSingle {
        return this._name2state[name];
    }
}