export interface AnimationSampler {
    get duration(): number;
    sample(time: number): void;
}