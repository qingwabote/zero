
export interface Sampler {
    input: ArrayLike<number>;
    output: ArrayLike<number>;
    interpolation: 'LINEAR' | 'STEP' | 'CUBICSPLINE';
}

export interface Channel {
    readonly node: readonly string[];
    readonly path: 'translation' | 'rotation' | 'scale' | 'weights';
    readonly sampler: Sampler;
}

export default class Animation {
    readonly duration: number;

    constructor(readonly name: string, readonly channels: readonly Channel[]) {
        let time = 0;
        for (const channel of channels) {
            const times = channel.sampler.input;
            time = Math.max(time, times[times.length - 1]);
        }
        this.duration = time;
    }
}