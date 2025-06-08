import { CachedFactory } from "bastard";
import { AnimationClip } from "../animating/AnimationClip.js";
import { Animation } from "../marionette/Animation.js";
import { SkinInstance } from "./SkinInstance.js";
import { SkinnedMeshRenderer } from "./SkinnedMeshRenderer.js";

const cache_keys: AnimationClip[] = [undefined!];
const cache: CachedFactory<typeof cache_keys, Record<number, number>> = new CachedFactory(function () { return {}; }, true)

export class SkinnedAnimation extends Animation {
    public baked: boolean = false;

    private _skin!: SkinInstance

    start(): void {
        this._skin = this.node.getComponent(SkinnedMeshRenderer, true)!.skin!;
    }

    override sample(time: number): void {
        this._skin.store = this.baked ? this._skin.proto.persistent : this._skin.proto.transient;

        if (this.baked) {
            const ratio = time / this.duration;
            const frame = Math.ceil(ratio * (this.duration * 60 - 1));

            cache_keys[0] = this.clips[this.index];
            const offsets = cache.get(cache_keys);
            let offset = offsets[frame];
            if (offset == undefined) {
                this._instances[this.index].sample(time);
                this._skin.update();
                offsets[frame] = this._skin.offset;
            } else {
                this._skin.offset = offset;
            }
        } else {
            this._instances[this.index].sample(time);
        }
    }
}