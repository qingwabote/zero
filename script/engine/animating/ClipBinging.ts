import { pk } from "puttyknife";
import { TRS } from "../core/math/TRS.js";
import { vec3 } from "../core/math/vec3.js";
import { vec4 } from "../core/math/vec4.js";
import { AnimationClip } from "./AnimationClip.js";

let float_handle = pk.heap.newBuffer(512 * 4, 0);
let float_view = pk.heap.getBuffer(float_handle, 'f32', 512);

const vec4_a = vec4.create();

/**
 * Bind clip and target, call sample to update target by time
 */
export class ClipBinging {
    readonly duration: number;

    private readonly _bindings: TRS[]

    constructor(private readonly _clip: AnimationClip, getTarget: (path: readonly string[]) => TRS) {
        const bindings: TRS[] = []
        let float_count = 0;
        for (const channel of _clip.channels) {
            const node = getTarget(channel.node)
            switch (channel.path) {
                case 'translation':
                    float_count += 3;
                    break;
                case 'rotation':
                    float_count += 4;
                    break;
                case 'scale':
                    float_count += 3;
                    break;
                default:
                    throw new Error(`unsupported path: ${channel.path}`);
            }
            bindings.push(node);
        }
        this.duration = _clip.duration;
        this._bindings = bindings;

        if (float_view.length < float_count) {
            pk.heap.delBuffer(float_handle);

            float_handle = pk.heap.newBuffer(float_count * 4, 0);
            float_view = pk.heap.getBuffer(float_handle, 'f32', float_count);
        }
    }

    sample(time: number): void {
        pk.fn.sampClip_sample(this._clip.handle, float_handle, time);
        let offset = 0;
        for (let i = 0; i < this._bindings.length; i++) {
            const channel = this._clip.channels[i];
            switch (channel.path) {
                case 'translation':
                    this._bindings[i].position = vec3.set(vec4_a, float_view[offset], float_view[offset + 1], float_view[offset + 2])
                    offset += 3;
                    break;
                case 'rotation':
                    this._bindings[i].rotation = vec4.set(vec4_a, float_view[offset], float_view[offset + 1], float_view[offset + 2], float_view[offset + 3])
                    offset += 4;
                    break;
                case 'scale':
                    this._bindings[i].scale = vec3.set(vec4_a, float_view[offset], float_view[offset + 1], float_view[offset + 2])
                    offset += 3;
                    break;
                default:
                    throw new Error(`unsupported path: ${channel.path}`);
            }
        }
    }
}