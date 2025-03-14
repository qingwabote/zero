import { WebSocket } from "boot";
import { Frame } from "./Frame.js";
import { JoystickInput } from "./JoystickInput.js";

export class FrameRemote extends Frame {
    readonly input: JoystickInput = new JoystickInput;

    private _socket!: WebSocket;

    start(): void {
        let id: number;

        let running = false;

        const socket = new WebSocket("ws://82.156.151.167:8080");
        socket.onopen = () => {
            this.input.on(JoystickInput.Events.DIRTY, () => {
                if (running) {
                    socket.send(JSON.stringify(this.input.point));
                } else {
                    socket.send('start');
                    running = true;
                }
            })
        }
        socket.onclose = () => {
            console.log('socket onclose')
        }
        socket.onmessage = (e) => {
            const res = JSON.parse(e.data);

            if (res.id) {
                id = res.id;
                return;
            }

            if (res[id]) {
                this.push({ input: res[id], delta: res.delta })
                return;
            }

            this.push({ delta: res.delta })
        }
        this._socket = socket;
    }
}