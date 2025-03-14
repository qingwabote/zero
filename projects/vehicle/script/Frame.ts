import { System, Vec2 } from "engine";
import { World } from "physics";
import { JoystickInput } from "./JoystickInput.js";

interface Data {
    delta: number;
    input?: Readonly<Vec2>;
}

export abstract class Frame extends System {
    abstract readonly input: JoystickInput;

    private readonly _queue: Data[] = [];

    constructor(readonly stepTime: number) {
        super();

        World.instance.stepTime = stepTime;
    }

    abstract start(): void;

    protected push(data: Data) {
        this._queue.push(data);
    }

    override update(dt: number): void {
        World.instance.ping();
        for (const data of this._queue) {
            if (data.input) {
                this.input.step(data.input)
            }
            World.instance.step(data.delta);
        }
        this._queue.length = 0;
        World.instance.pong();

        World.instance.draw();
    }
}

export declare namespace Frame {
    export { Data }
}