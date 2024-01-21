export class AnimationStateBase {
    constructor() {
        /**When set new time, we should ensure the frame at the specified time being played at next update.*/
        this._time_dirty = true;
        this._time = 0;
        this.speed = 1;
    }
    get time() {
        return this._time;
    }
    set time(value) {
        this._time = value;
        this._time_dirty = true;
    }
    update(dt) {
        const duration = this.duration;
        this._time += this._time_dirty ? 0 : (dt * this.speed);
        this._time = Math.min(this._time, duration);
        this.sample(this._time);
        this._time_dirty = false;
        if (this._time >= duration) {
            this.time = 0;
        }
    }
}
