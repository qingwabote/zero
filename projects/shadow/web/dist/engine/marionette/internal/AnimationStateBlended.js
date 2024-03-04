import { AnimationState } from "./AnimationState.js";
export class AnimationStateBlended extends AnimationState {
    get weights() {
        return this._weights;
    }
    get duration() {
        let duration = 0;
        for (let i = 0; i < this._clips.length; i++) {
            duration += this._clips[i].duration * this._weights[i];
        }
        return duration;
    }
    get input() {
        return this._input;
    }
    set input(value) {
        this._input = value;
        this.updateWeights();
    }
    constructor(_clips, _thresholds, _context) {
        super();
        this._clips = _clips;
        this._thresholds = _thresholds;
        this._context = _context;
        this._input = 0;
        this._weights = new Array(_clips.length);
    }
    sample(time) {
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
    updateWeights() {
        const { _weights: weights, _thresholds: thresholds, _input: input } = this;
        weights.fill(0);
        if (input <= thresholds[0]) {
            weights[0] = 1;
        }
        else if (input >= thresholds[thresholds.length - 1]) {
            weights[weights.length - 1] = 1;
        }
        else {
            let iGreater = thresholds.findIndex(value => value > input);
            const greater = thresholds[iGreater];
            const smaller = thresholds[iGreater - 1];
            const d = greater - smaller;
            weights[iGreater] = (input - smaller) / d;
            weights[iGreater - 1] = (greater - input) / d;
        }
    }
}
