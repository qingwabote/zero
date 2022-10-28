import Component from "../Component.js";
import Label from "./Label.js";

export default class FPS extends Component {
    private _time: number = 0;
    private _frames: number = 0;

    override start(): void {

    }

    override update(dt: number): void {
        const label = this._node.getComponent(Label);
        if (!label) return;

        const now = Date.now();
        const duration = now - this._time;
        if (duration > 1000) {
            const fps = this._frames * 1000 / duration;
            label.text = "FPS: " + fps;
            this._frames = 0;
            this._time = now;
        }

        this._frames++;
    }
}