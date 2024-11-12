
interface Sampler {
    /**a set of floating-point scalar values representing linear time in seconds*/
    input: ArrayLike<number>;
    /**a set of vectors or scalars representing the animated property*/
    output: ArrayLike<number>;
    interpolation: 'LINEAR' | 'STEP' | 'CUBICSPLINE';
}

interface Channel {
    readonly node: readonly string[];
    readonly path: 'translation' | 'rotation' | 'scale' | 'weights';
    readonly sampler: Sampler;
}

export class AnimationClip {
    readonly duration: number;

    constructor(readonly channels: readonly Channel[], readonly name: string) {
        let duration = 0;
        for (const channel of channels) {
            duration = Math.max(duration, channel.sampler.input[channel.sampler.input.length - 1]);
        }
        this.duration = duration;
    }
}

export declare namespace AnimationClip {
    export { Channel }
}