
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

export default interface AnimationClip {
    readonly name: string;
    readonly channels: readonly Channel[];
}