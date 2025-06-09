import { CachedFactory } from "bastard";
import { AnimationClip } from "../animating/AnimationClip.js";
import { Transient } from "../core/render/scene/Transient.js";
import { Animation } from "../marionette/Animation.js";
import { SkinInstance } from "./SkinInstance.js";
import { SkinnedMeshRenderer } from "./SkinnedMeshRenderer.js";

const cache_keys: AnimationClip[] = [undefined!];
const cache: CachedFactory<typeof cache_keys, Record<number, number>> = new CachedFactory(function () { return {}; }, true)

export class SkinnedAnimation extends Animation {
    private _baked: boolean = true;
    public get baked(): boolean {
        return this._baked;
    }
    public set baked(value: boolean) {
        if (this._skin) {
            this._skin.store = value ? this._skin.proto.persistent : this._skin.proto.transient;
        }
        this._baked = value;
    }

    private _skin!: SkinInstance

    private _frame = new Transient(-1, -1);

    start(): void {
        this._skin = this.node.getComponent(SkinnedMeshRenderer, true)!.skin!;
        this._skin.store = this._baked ? this._skin.proto.persistent : this._skin.proto.transient;
    }

    override sample(time: number): void {
        if (!this.baked) {
            super.sample(time);
            return;
        }

        const ratio = time / this.duration;
        const frame = Math.ceil(ratio * (this.duration * 60 - 1));

        cache_keys[0] = this.clips[this.index];
        const offsets = cache.get(cache_keys);
        const offset = offsets[frame];
        if (offset != undefined && (offset & 1) != 0) {
            this._skin.offset = offset >> 1;
            this._skin.updated.value = 1;
            return;
        }

        if (offset == undefined) {
            offsets[frame] = (this._skin.alloc() << 1) | 1;
        } else {
            this._skin.offset = offset >> 1;
            this._skin.updated.value = 0;
            offsets[frame] = offset | 1;
        }
        this._frame.value = frame;
        super.sample(time);
    }

    override upload(): void {
        if (this._frame.value != -1) {
            cache_keys[0] = this.clips[this.index];
            const offsets = cache.get(cache_keys);
            if (this._skin.updated.value == 0) {
                offsets[this._frame.value] &= ~1;
            }
        }
    }
}