import { WebSocket } from "boot";
import { Zero } from "engine";
import { PhysicsSystem } from "physics";
import { Frame } from "./Frame.js";
import { JoystickInputRemote } from "./JoystickInputRemote.js";
import { PhysicsStepper } from "./PhysicsStepper.js";

const stepTime = 1 / 30;

const physicsStepper = new PhysicsStepper(stepTime);
Zero.unregisterSystem(PhysicsSystem.instance);
Zero.registerSystem(physicsStepper, 1);

export class FrameRemote implements Frame {
    readonly input = new JoystickInputRemote

    readonly _socket: WebSocket;

    constructor() {
        let id;

        const socket = new WebSocket("ws://127.0.0.1:8080")
        socket.onopen = () => {
            console.log('socket onopen')
        }
        socket.onclose = () => {
            console.log('socket onclose')
        }
        socket.onmessage = (e) => {
            console.log('socket onmessage', e.data)
            if (e.data == "{}") {
                physicsStepper.step(stepTime);
                return;
            }

            const res = JSON.parse(e.data);
            if (res.id) {
                id = res.id;
                return;
            }
        }
        this._socket = socket;

        physicsStepper.step(0);
    }
}