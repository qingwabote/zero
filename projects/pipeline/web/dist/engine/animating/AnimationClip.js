export class AnimationClip {
    constructor(channels, name) {
        this.channels = channels;
        this.name = name;
        let duration = 0;
        for (const channel of channels) {
            duration = Math.max(duration, channel.sampler.input[channel.sampler.input.length - 1]);
        }
        this.duration = duration;
    }
}
