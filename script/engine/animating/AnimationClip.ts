import { pk } from "puttyknife";

interface Sampler {
    /**a set of floating-point scalar values representing linear time in seconds*/
    inputData: pk.BufferHandle;
    inputLength: number;
    /**a set of vectors or scalars representing the animated property*/
    output: pk.BufferHandle;
    interpolation: 'LINEAR' | 'STEP' | 'CUBICSPLINE';
    duration: number;
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
            duration = Math.max(duration, channel.sampler.duration);
        }
        this.duration = duration;
    }
}

export declare namespace AnimationClip {
    export { Channel, Sampler }
}