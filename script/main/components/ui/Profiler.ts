import { ZeroEvent } from "../../core/Zero.js";
import TextRenderer from "../TextRenderer.js";
import UIContainer from "./UIContainer.js";
import UIRenderer from "./UIRenderer.js";

export default class Profiler extends UIContainer {
    private _time: number = 0;
    private _frames: number = 0;

    private _fps: number = 0;

    private _logic_time = 0

    private _render_time = 0;

    private _text!: UIRenderer<TextRenderer>;

    override start(): void {
        const text = UIRenderer.create(TextRenderer);
        this.addElement(text);
        this._text = text;

        this.profileLogic();
        this.profileRender();
    }

    override update(): void {
        super.update();
        const now = Date.now();
        const duration = now - this._time;
        if (duration > 1000) {
            this._fps = this._frames * 1000 / duration;
            this._frames = 0;
            this._time = now;
        }
        this._frames++;

        this._text.impl.text = `FPS: ${this._fps.toFixed(2)}
Draw call: ${zero.flow.drawCalls}
Render(ms): ${this._render_time.toFixed(2)}
Logic(ms): ${this._logic_time.toFixed(2)}`;
    }

    private profileLogic() {
        let time = 0;
        let delta = 0;
        let count = 0;
        zero.on(ZeroEvent.LOGIC_START, () => {
            time = Date.now();
        })
        zero.on(ZeroEvent.LOGIC_END, () => {
            delta += Date.now() - time;
            count++;
            if (count == 60) {
                this._logic_time = delta / count;
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