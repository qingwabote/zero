import { Component } from "../core/Component.js";
import { AnimationStateSingle } from "./internal/AnimationStateSingle.js";
import { AnimationSystem } from "./internal/AnimationSystem.js";
import { ClipBinging } from "./internal/ClipBinging.js";
export class Animation extends Component {
    constructor() {
        super(...arguments);
        this._name2state = {};
        this._clips = [];
    }
    get clips() {
        return this._clips;
    }
    set clips(value) {
        for (const clip of value) {
            this._name2state[clip.name] = new AnimationStateSingle(new ClipBinging(clip, path => this.node.getChildByPath(path)));
        }
        this._clips = value;
    }
    play(name) {
        AnimationSystem.instance.addAnimation(this._name2state[name]);
    }
    getState(name) {
        return this._name2state[name];
    }
}
