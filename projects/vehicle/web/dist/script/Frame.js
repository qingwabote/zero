import { System } from "engine";
import { World } from "physics";
export class Frame extends System {
    constructor(stepTime) {
        super();
        this.stepTime = stepTime;
        this._queue = [];
        World.instance.stepTime = stepTime;
    }
    push(data) {
        this._queue.push(data);
    }
    update(dt) {
        World.instance.ping();
        for (const data of this._queue) {
            if (data.input) {
                this.input.step(data.input);
            }
            World.instance.step(data.delta);
        }
        this._queue.length = 0;
        World.instance.pong();
        World.instance.draw();
    }
}
