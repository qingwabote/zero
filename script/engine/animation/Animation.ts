import { AnimationClip } from "../assets/AnimationClip.js";
import { Component } from "../core/Component.js";
import { AnimationStateSingle } from "./internal/AnimationStateSingle.js";
import { AnimationSystem } from "./internal/AnimationSystem.js";
import { ClipBinging } from "./internal/ClipBinging.js";

export class Animation extends Component {
    private _name2state: Record<string, AnimationStateSingle> = {};

    private _clips: readonly AnimationClip[] = [];
    public get clips(): readonly AnimationClip[] {
        return this._clips;
    }
    public set clips(value: readonly AnimationClip[]) {
        for (const clip of value) {
            this._name2state[clip.name] = this.createState(clip);
        }
        this._clips = value;
    }

    play(name: string) {
        AnimationSystem.instance.addAnimation(this._name2state[name]);
    }

    getState(name: string): AnimationStateSingle {
        return this._name2state[name];
    }

    private createState(clip: AnimationClip) {
        return new AnimationStateSingle(new ClipBinging(clip, path => this.node.getChildByPath(path)!));
    }
}