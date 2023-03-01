import Component from "../core/Component.js";
import vec2 from "../core/math/vec2.js";
import { ZeroEvent } from "../core/Zero.js";
import TextRenderer from "./2d/TextRenderer.js";
import UIRenderer from "./ui/UIRenderer.js";

export default class Profiler extends Component {
    private _time: number = 0;
    private _frames: number = 0;

    private _fps: number = 0;

    private _gameLogic_time = 0

    private _render_time = 0;

    private _text!: UIRenderer<TextRenderer>;

    override start(): void {
        const text = UIRenderer.create(TextRenderer);
        text.node.visibilityFlag = this.node.visibilityFlag;
        text.anchor = vec2.create(0, 0)
        this.node.addChild(text.node);
        this._text = text;

        this.profileGameLogic();
        this.profileRender();
    }

    override update(): void {
        const now = Date.now();
        const duration = now - this._time;
        if (duration > 1000) {
            this._fps = this._frames * 1000 / duration;
            this._frames = 0;
            this._time = now;
        }
        this._frames++;

        this._text.impl.text = `FPS: ${this._fps.toString().slice(0, 5)}
Draw call: ${zero.flow.drawCalls}
Render(ms): ${this._render_time.toString().slice(0, 5)}
Logic(ms): ${this._gameLogic_time.toString().slice(0, 5)}`;
    }

    private profileGameLogic() {
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