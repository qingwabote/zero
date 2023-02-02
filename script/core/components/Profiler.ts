import Component from "../Component.js";
import { ZeroEvent } from "../Zero.js";
import Label from "./Label.js";

export default class Profiler extends Component {
    private _time: number = 0;
    private _frames: number = 0;

    private _fps: number = 0;

    private _gameLogic_time = 0

    private _render_time = 0;

    override start(): void {
        this._node.addComponent(Label);

        this.profileGameLogic();
        this.profileRender();
    }

    override update(): void {
        const label = this._node.getComponent(Label);
        if (!label) return;

        const now = Date.now();
        const duration = now - this._time;
        if (duration > 1000) {
            this._fps = this._frames * 1000 / duration;
            this._frames = 0;
            this._time = now;
        }
        this._frames++;

        label.text = `FPS: ${this._fps.toString().slice(0, 5)}
Draw call: ${zero.renderFlow.drawCalls}
Render(ms): ${this._render_time.toString().slice(0, 5)}
Logic(ms): ${this._gameLogic_time.toString().slice(0, 5)}`;
    }

    private profileGameLogic() {
        let time = 0;
        let delta = 0;
        let count = 0;
        zero.on(ZeroEvent.UPDATE_START, () => {
            time = Date.now();
        })
        zero.on(ZeroEvent.UPDATE_END, () => {
            delta += Date.now() - time;
            count++;
            if (count == 60) {
                this._gameLogic_time = delta / count;
                delta = 0;
                count = 0;
            }
        })
    }

    private profileRender() {
        let time = 0;
        let delta = 0;
        let count = 0;
        zero.on(ZeroEvent.RENDER_START, () => {
            time = Date.now();
        })
        zero.on(ZeroEvent.RENDER_END, () => {
            delta += Date.now() - time;
            count++;
            if (count == 60) {
                this._render_time = delta / count;
                delta = 0;
                count = 0;
            }
        })
    }
}