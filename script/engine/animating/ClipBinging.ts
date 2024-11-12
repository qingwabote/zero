import { TRS } from "../core/math/TRS.js";
import { AnimationClip } from "./AnimationClip.js";
import { ChannelBinding } from "./ChannelBinding.js";
import { ChannelBindingQuat, ChannelBindingVec3 } from "./values.js";

/**
 * Bind clip and target, call sample to update target by time
 */
export class ClipBinging {
    readonly duration: number;

    private readonly _channels: ChannelBinding[];

    constructor(clip: AnimationClip, getTarget: (path: readonly string[]) => TRS) {
        const channels: ChannelBinding[] = [];
        for (const channel of clip.channels) {
            if (channel.sampler.interpolation != 'LINEAR') {
                throw new Error(`unsupported interpolation: ${channel.sampler.interpolation}`);
            }
            const node = getTarget(channel.node)
            let property: ChannelBinding.Value;
            switch (channel.path) {
                case 'translation':
                    property = new ChannelBindingVec3(node, 'position');
                    break;
                case 'rotation':
                    property = new ChannelBindingQuat(node, 'rotation');
                    break;
                case 'scale':
                    property = new ChannelBindingVec3(node, 'scale');
                    break;
                default:
                    throw new Error(`unsupported path: ${channel.path}`);
            }
            channels.push(new ChannelBinding(channel.sampler.input, channel.sampler.output, property));
        }
        this.duration = clip.duration;
        this._channels = channels;
    }

    sample(time: number): void {
        for (const channel of this._channels) {
            channel.sample(time);
        }
    }
}