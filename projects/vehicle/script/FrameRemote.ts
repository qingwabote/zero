import { WebSocket } from "boot";
import { Frame } from "./Frame.js";
import { JoystickInput } from "./JoystickInput.js";

const stepTime = 1 / 30;

export class FrameRemote extends Frame {
    readonly input: JoystickInput = new JoystickInput;

    private _socket!: WebSocket;

    start(): void {
        let id: number;

        const socket = new WebSocket("ws://127.0.0.1:8080");
        socket.onopen = () => {
            this.input.on(JoystickInput.Events.DIRTY, () => {
                socket.send(JSON.stringify(this.input.point));
            })
        }
        socket.onclose = () => {
            console.log('socket onclose')
        }
        socket.onmessage = (e) => {
            console.log('socket onmessage', e.data)
            if (e.data == "{}") {
                this.push({ delta: stepTime })
                return;
            }

            const res = JSON.parse(e.data);
            if (res.id) {
                id = res.id;
                return;
            }

            if (res[id]) {
                this.push({ input: res[id], delta: stepTime })
            }
        }
        this._socket = socket;

        this.push({ delta: 0 })
    }
}