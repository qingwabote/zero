import { now } from "boot";
import { TextRenderer, Zero, ZeroEvent } from "engine";
import { ElementContainer } from "./ElementContainer.js";
import { Renderer } from "./Renderer.js";
let boot_time = 0;
export class Profiler extends ElementContainer {
    constructor(node) {
        super(node);
        this._time = 0;
        this._frames = 0;
        this._fps = 0;
        this._logic_time = 0;
        this._render_time = 0;
        const text = Renderer.create(TextRenderer);
        this.addElement(text);
        this._text = text;
        this.profileLogic();
        this.profileRender();
    }
    update(dt) {
        boot_time = boot_time || dt;
        if (this._time > 1) {
            this._fps = this._frames / this._time;
            this._frames = 0;
            this._time = 0;
        }
        this._frames++;
        this._time += dt;
        this._text.impl.text = `FPS: ${this._fps.toFixed(2)}
draws: ${Zero.instance.commandCalls.draws}
render passes: ${Zero.instance.commandCalls.renderPasses}
render: ${this._render_time.toFixed(2)}ms
logic: ${this._logic_time.toFixed(2)}ms
boot: ${boot_time.toFixed(2)}s`;
    }
    profileLogic() {
        let time = 0;
        let delta = 0;
        let count = 0;
        Zero.instance.on(ZeroEvent.LOGIC_START, () => {
            time = now();
        });
        Zero.instance.on(ZeroEvent.LOGIC_END, () => {
            delta += now() - time;
            count++;
            if (count == 60) {
                this._logic_time = delta / count;
                delta = 0;
                count = 0;
            }
        });
    }
    profileRender() {
        let time = 0;
        let delta = 0;
        let count = 0;
        Zero.instance.on(ZeroEvent.RENDER_START, () => {
            time = now();
        });
        Zero.instance.on(ZeroEvent.RENDER_END, () => {
            delta += now() - time;
            count++;
            if (count == 60) {
                this._render_time = delta / count;
                delta = 0;
                count = 0;
            }
        });
    }
}