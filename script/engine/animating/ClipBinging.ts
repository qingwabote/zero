import { pk } from "puttyknife";
import { TRS } from "../core/math/TRS.js";
import { Vec3Like } from "../core/math/vec3.js";
import { Vec4Like } from "../core/math/vec4.js";
import { AnimationClip } from "./AnimationClip.js";

interface ChannelBinding {
    sampler: AnimationClip.Sampler
    transform: TRS
}

const vec4_a_handle = pk.heap.addBuffer(new Float32Array(4));
const vec4_a_data = pk.heap.getBuffer(vec4_a_handle, 'f32', 4);

/**
 * Bind clip and target, call sample to update target by time
 */
export class ClipBinging {
    readonly duration: number;

    private readonly _positions: ChannelBinding[];
    private readonly _rotations: ChannelBinding[];
    private readonly _scales: ChannelBinding[];

    constructor(clip: AnimationClip, getTarget: (path: readonly string[]) => TRS) {
        const positions: ChannelBinding[] = [];
        const rotations: ChannelBinding[] = [];
        const scales: ChannelBinding[] = [];
        for (const channel of clip.channels) {
            if (channel.sampler.interpolation != 'LINEAR') {
                throw new Error(`unsupported interpolation: ${channel.sampler.interpolation}`);
            }
            const node = getTarget(channel.node)
            switch (channel.path) {
                case 'translation':
                    positions.push({
                        sampler: channel.sampler,
                        transform: node
                    })
                    break;
                case 'rotation':
                    rotations.push({
                        sampler: channel.sampler,
                        transform: node
                    });
                    break;
                case 'scale':
                    scales.push({
                        sampler: channel.sampler,
                        transform: node
                    });
                    break;
                default:
                    throw new Error(`unsupported path: ${channel.path}`);
            }
        }
        this.duration = clip.duration;
        this._positions = positions;
        this._rotations = rotations;
        this._scales = scales;
    }

    sample(time: number): void {
        for (const channel of this._positions) {
            pk.fn.sampVec3(vec4_a_handle, channel.sampler.inputData, channel.sampler.inputLength, channel.sampler.output, time);
            channel.transform.position = vec4_a_data as unknown as Vec3Like;
        }
        for (const channel of this._rotations) {
            pk.fn.sampQuat(vec4_a_handle, channel.sampler.inputData, channel.sampler.inputLength, channel.sampler.output, time);
            channel.transform.rotation = vec4_a_data as unknown as Vec4Like;
        }
        for (const channel of this._scales) {
            pk.fn.sampVec3(vec4_a_handle, channel.sampler.inputData, channel.sampler.inputLength, channel.sampler.output, time);
            channel.transform.scale = vec4_a_data as unknown as Vec3Like;
        }
    }
}