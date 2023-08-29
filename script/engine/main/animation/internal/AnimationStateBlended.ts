import { AnimationStateBase } from "./AnimationStateBase.js";
import { ClipBinging } from "./ClipBinging.js";

export interface BlendContext {
    weight: number;
    flush(): void;
}

export class AnimationStateBlended extends AnimationStateBase {
    private _weights: number[];
    public get weights(): readonly number[] {
        return this._weights;
    }

    public override get duration(): number {
        let duration = 0;
        for (let i = 0; i < this._clips.length; i++) {
            duration += this._clips[i].duration * this._weights[i];
        }
        return duration;
    }

    private _input: number = 0;
    public get input(): number {
        return this._input;
    }
    public set input(value: number) {
        this._input = value;
        this.updateWeights();
    }

    constructor(private _clips: readonly ClipBinging[], private _thresholds: readonly number[], private _context: BlendContext) {
        super();
        this._weights = new Array(_clips.length);
    }

    protected override sample(time: number) {
        const progress = time / this.duration;

        for (let i = 0; i < this._clips.length; i++) {
            const clip = this._clips[i];
            time = clip.duration * progress;
            const weight = this._weights[i];
            if (!weight) {
                continue;
            }
            this._context.weight = weight;
            for (const channel of clip.channels) {
                channel.sample(time);
            }
        }

        this._context.flush();
    }

    private updateWeights(): void {
        const { _weights: weights, _thresholds: thresholds, input } = this;

        weights.fill(0);
        if (input <= thresholds[0]) {
            weights[0] = 1;
        } else if (input >= thresholds[thresholds.length - 1]) {
            weights[weights.length - 1] = 1;
        } else {
            let iGreater = thresholds.findIndex(value => value > input);
            const greater = thresholds[iGreater];
            const smaller = thresholds[iGreater - 1];
            const d = greater - smaller;
            weights[iGreater] = (input - smaller) / d;
            weights[iGreater - 1] = (greater - input) / d;
        }
    }
}