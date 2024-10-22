import { ChannelBinding } from "./ChannelBinding.js";
import { ChannelBindingQuat, ChannelBindingVec3 } from "./values.js";
export class ClipBinging {
    constructor(clip, getTRS) {
        const channels = [];
        let duration = 0;
        for (const channel of clip.channels) {
            if (channel.sampler.interpolation != 'LINEAR') {
                throw new Error(`unsupported interpolation: ${channel.sampler.interpolation}`);
            }
            const node = getTRS(channel.node);
            let property;
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
            duration = Math.max(duration, channel.sampler.input[channel.sampler.input.length - 1]);
            channels.push(new ChannelBinding(channel.sampler.input, channel.sampler.output, property));
        }
        this.duration = duration;
        this._channels = channels;
    }
    sample(time) {
        for (const channel of this._channels) {
            channel.sample(time);
        }
    }
}
