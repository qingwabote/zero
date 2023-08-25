import { AnimationState } from "../../../animation/AnimationState.js";

export abstract class AnimationStateBase implements AnimationState {
    public abstract get duration(): number;

    /**When set new time, we should ensure the frame at the specified time being played at next update.*/
    private _time_dirty = true;
    private _time: number = 0;
    public get time(): number {
        return this._time;
    }
    public set time(value: number) {
        this._time = value;
        this._time_dirty = true;
    }

    speed: number = 1;

    update(dt: number): void {
        const duration = this.duration;

        this._time += this._time_dirty ? 0 : (dt * this.speed);
        this._time = Math.min(this._time, duration);

        this.sample(this._time);

        this._time_dirty = false;

        if (this._time >= duration) {
            this.time = 0;
        }
    }

    protected abstract sample(time: number): void;
}