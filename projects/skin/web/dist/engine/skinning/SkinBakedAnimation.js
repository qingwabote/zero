import { AnimationState } from "../animating/AnimationState.js";
import { Component } from "../core/Component.js";
import { SkinBaked } from "./SkinBaked.js";
import { SkinnedMeshRenderer } from "./SkinnedMeshRenderer.js";
class SkinBakedAnimationState extends AnimationState {
    get duration() {
        return this._clip.duration;
    }
    constructor(_clip, _skin) {
        super();
        this._clip = _clip;
        this._skin = _skin;
        this._frames = 60;
    }
    sample(time) {
        const ratio = time / this.duration;
        const frame = Math.ceil(ratio * this._frames);
    }
}
export class SkinBakedAnimation extends Component {
    constructor(node) {
        super(node);
        this.clips = [];
        const render = node.getComponent(SkinnedMeshRenderer, true);
        if (!(render.skin.strategy instanceof SkinBaked)) {
            render.skin.strategy = new SkinBaked(render.skin.proto);
        }
    }
    play(name) {
    }
}
