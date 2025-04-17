import { TRS } from "../core/math/TRS.js";
import { vec4 } from "../core/math/vec4.js";
import { AnimationClip } from "./AnimationClip.js";
import { sampleQuat, sampleVec3 } from "./sampler.js";

interface ChannelBinding {
    input: ArrayLike<number>,
    output: ArrayLike<number>,
    transform: TRS
}

const vec4_a = vec4.create();

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
                        input: channel.sampler.input,
                        output: channel.sampler.output,
                        transform: node
                    })
                    break;
                case 'rotation':
                    rotations.push({
                        input: channel.sampler.input,
                        output: channel.sampler.output,
                        transform: node
                    });
                    break;
                case 'scale':
                    scales.push({
                        input: channel.sampler.input,
                        output: channel.sampler.output,
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
            sampleVec3(vec4_a, channel.input, channel.output, time);
            channel.transform.position = vec4_a;
        }
        for (const channel of this._rotations) {
            sampleQuat(vec4_a, channel.input, channel.output, time);
            channel.transform.rotation = vec4_a;
        }
        for (const channel of this._scales) {
            sampleVec3(vec4_a, channel.input, channel.output, time);
            channel.transform.scale = vec4_a;
        }
    }
}