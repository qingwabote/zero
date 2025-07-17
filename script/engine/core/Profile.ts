import { now } from "boot";

export class Profile<Enum> {
    private readonly _record: number[];
    private readonly _average: number[];

    private _time: number = now() / 1000;
    private _frames: number = 1;

    private _fps: number = 0;
    public get fps(): number {
        return this._fps;
    }

    constructor(num: number) {
        this._record = new Array(num).fill(0);
        this._average = new Array(num).fill(0);
    }

    record(key: Enum[keyof Enum], dt: number) {
        this._record[key as any] += dt;
    }

    average(key: Enum[keyof Enum]): number {
        return this._average[key as any];
    }

    update() {
        const t = now() / 1000;
        const d = t - this._time;
        if (d < 1) {
            this._frames++;
            return;
        }

        for (let i = 0; i < this._record.length; i++) {
            this._average[i] = this._record[i] / this._frames;
            this._record[i] = 0;
        }

        this._fps = this._frames / d;

        this._frames = 1;
        this._time = t;
    }
}