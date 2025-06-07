import { CachedFactory } from "bastard";
import { AnimationClip } from "../animating/AnimationClip.js";
import { AnimationClipInstance } from "../animating/AnimationClipInstance.js";
import { AnimationSampler } from "../animating/AnimationSampler.js";
import { AnimationState } from "../animating/AnimationState.js";
import { AnimationSystem } from "../animating/AnimationSystem.js";
import { Component } from "../core/Component.js";
import { SkinInstance } from "./SkinInstance.js";
import { SkinnedMeshRenderer } from "./SkinnedMeshRenderer.js";

const cache_keys: AnimationClip[] = [undefined!];
const cache: CachedFactory<typeof cache_keys, Record<number, number>> = new CachedFactory(function () { return {}; }, true)

class SkinnedAnimationSampler implements AnimationSampler {
    public get duration(): number {
        return this._clip.duration
    }

    public baked: boolean = false;

    private readonly _binding: AnimationClipInstance;

    private readonly _frames: number;

    constructor(private readonly _clip: AnimationClip, private readonly _skin: SkinInstance) {
        this._binding = new AnimationClipInstance(_clip, _clip.channels.map(channel => _skin.root.getChildByPath(channel.node)!))
        this._frames = _clip.duration * 60;
    }

    public update(time: number): void {
        this._skin.store = this.baked ? this._skin.proto.persistent : this._skin.proto.transient;

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
            } else {
                this._skin.offset = offset;
            }
        } else {
            this._binding.sample(time);
        }
    }
}

export class SkinnedAnimation extends Component {
    clips: readonly AnimationClip[] = [];

    private _state: AnimationState | undefined = undefined;
    get state(): AnimationState | undefined {
        return this._state;
    }

    private _states: Record<string, AnimationState> = {};

    play(name: string) {
        if (this._state) {
            AnimationSystem.instance.removeAnimation(this._state);
        }
        let state = this._states[name];
        if (!state) {
            this._states[name] = state = new AnimationState(new SkinnedAnimationSampler(this.clips.find(clip => clip.name == name)!, this.node.getComponent(SkinnedMeshRenderer, true)!.skin!))
        }
        AnimationSystem.instance.addAnimation(state);
    }
}