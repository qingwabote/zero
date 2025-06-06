export interface AnimationSampler {
    get duration(): number;
    update(time: number): void;
}