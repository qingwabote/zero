import { now } from "boot";
import { Node } from "../../core/Node.js";
import { Zero, ZeroEvent } from "../../core/Zero.js";
import { TextRenderer } from "../TextRenderer.js";
import { UIContainer } from "./UIContainer.js";
import { UIRenderer } from "./UIRenderer.js";

let boot_time = 0;

export class Profiler extends UIContainer {
    private _time: number = 0;
    private _frames: number = 0;

    private _fps: number = 0;

    private _logic_time = 0

    private _render_time = 0;

    private _text!: UIRenderer<TextRenderer>;

    constructor(node: Node) {
        super(node);

        const text = UIRenderer.create(TextRenderer);
        this.addElement(text);
        this._text = text;

        this.profileLogic();
        this.profileRender();
    }

    override update(dt: number): void {
        super.update(dt);

        boot_time = boot_time || dt;

        if (this._time > 1) {
            this._fps = this._frames / this._time;
            this._frames = 0;
            this._time = 0;
        }
        this._frames++;
        this._time += dt;

        this._text.impl.text = `FPS: ${this._fps.toFixed(2)}
Draw call: ${Zero.instance.flow.drawCalls}
Render(ms): ${this._render_time.toFixed(2)}
Logic(ms): ${this._logic_time.toFixed(2)}
Boot(s): ${boot_time.toFixed(2)}`;
    }

    private profileLogic() {
        let time = 0;
        let delta = 0;
        let count = 0;
        Zero.instance.on(ZeroEvent.LOGIC_START, () => {
            time = now();
        })
        Zero.instance.on(ZeroEvent.LOGIC_END, () => {
            delta += now() - time;
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
        Zero.instance.on(ZeroEvent.RENDER_START, () => {
            time = now();
        })
        Zero.instance.on(ZeroEvent.RENDER_END, () => {
            delta += now() - time;
            count++;
            if (count == 60) {
                this._render_time = delta / count;
                delta = 0;
                count = 0;
            }
        })
    }
}