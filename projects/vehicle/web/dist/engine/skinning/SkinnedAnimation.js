import { CachedFactory } from "bastard";
import { AnimationState } from "../animating/AnimationState.js";
import { AnimationSystem } from "../animating/AnimationSystem.js";
import { ClipBinging } from "../animating/ClipBinging.js";
import { Component } from "../core/Component.js";
import { SkinnedMeshRenderer } from "./SkinnedMeshRenderer.js";
const cache_keys = [undefined];
const cache = new CachedFactory(function () { return {}; }, true);
class SkinnedAnimationState extends AnimationState {
    get duration() {
        return this._clip.duration;
    }
    constructor(_clip, _skin) {
        super();
        this._clip = _clip;
        this._skin = _skin;
        this.baked = true;
        this._binding = new ClipBinging(_clip, path => _skin.root.getChildByPath(path));
        this._frames = _clip.duration * 60;
    }
    sample(time) {
        this._skin.store = this.baked ? this._skin.proto.baked : this._skin.proto.alive;
        if (this.baked) {
            const ratio = time / this.duration;
            const frame = Math.ceil(ratio * (this._frames - 1));
            cache_keys[0] = this._clip;
            const offsets = cache.get(cache_keys);
            let offset = offsets[frame];
            if (offset == undefined) {
                this._binding.sample(time);
                this._skin.update();
                offsets[frame] = this._skin.offset;
            }
            else {
                this._skin.offset = offset;
            }
        }
        else {
            this._binding.sample(time);
        }
    }
}
export class SkinnedAnimation extends Component {
    constructor() {
        super(...arguments);
        this.clips = [];
        this._state = undefined;
        this._states = {};
    }
    get state() {
        return this._state;
    }
    play(name) {
        if (this._state) {
            AnimationSystem.instance.removeAnimation(this._state);
        }
        let state = this._states[name];
        if (!state) {
            this._states[name] = state = new SkinnedAnimationState(this.clips.find(clip => clip.name == name), this.node.getComponent(SkinnedMeshRenderer, true).skin);
        }
        AnimationSystem.instance.addAnimation(state);
    }
}
