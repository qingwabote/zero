
export interface Sampler {
    /**a set of floating-point scalar values representing linear time in seconds*/
    input: ArrayLike<number>;
    /**a set of vectors or scalars representing the animated property*/
    output: ArrayLike<number>;
    interpolation: 'LINEAR' | 'STEP' | 'CUBICSPLINE';
}

export interface Channel {
    readonly node: readonly string[];
    readonly path: 'translation' | 'rotation' | 'scale' | 'weights';
    readonly sampler: Sampler;
}

export interface AnimationClip {
    readonly name: string;
    readonly channels: readonly Channel[];
}