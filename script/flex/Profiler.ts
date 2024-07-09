import { now } from "boot";
import { Node, TextRenderer, Zero, render } from "engine";
import { ElementContainer } from "./ElementContainer.js";
import { Renderer } from "./Renderer.js";

let boot_time = 0;

export class Profiler extends ElementContainer {
    private _time: number = 0;
    private _frames: number = 1;

    private _fps: number = 0;

    private _logic_time = 0

    private _render_time = 0;

    private _model_time = 0;

    private _cull_time = 0;

    private _halt_time = 0;

    private _text!: Renderer<TextRenderer>;

    constructor(node: Node) {
        super(node);

        const text = Renderer.create(TextRenderer);
        this.addElement(text);
        this._text = text;

        let logic_start = 0;
        let logic_delta = 0;

        let cull_start = 0;
        let cull_delta = 0;

        let model_start = 0;
        let model_delta = 0

        let render_start = 0;
        let render_delta = 0;

        let halt_start = 0;
        let halt_delta = 0;

        Zero.instance.on(Zero.Event.LOGIC_START, () => { logic_start = now(); })
        Zero.instance.on(Zero.Event.LOGIC_END, () => { logic_delta += now() - logic_start; })

        Zero.instance.profile.on(render.Profile.Event.CULL_START, () => { cull_start = now(); })
        Zero.instance.profile.on(render.Profile.Event.CULL_END, () => { cull_delta += now() - cull_start; })

        Zero.instance.scene.event.on(render.Scene.Event.MODEL_UPDATE_START, () => { model_start = now(); })
        Zero.instance.scene.event.on(render.Scene.Event.MODEL_UPDATE_END, () => { model_delta += now() - model_start; })

        Zero.instance.on(Zero.Event.RENDER_START, () => { render_start = now(); })
        Zero.instance.on(Zero.Event.RENDER_END, () => { render_delta += now() - render_start; })

        Zero.instance.on(Zero.Event.HALT_START, () => { halt_start = now(); })
        Zero.instance.on(Zero.Event.HALT_END, () => { halt_delta += now() - halt_start; })

        Zero.instance.on(Zero.Event.FRAME_END, () => {
            if (Zero.frameCount % 60 == 0) {
                this._logic_time = logic_delta / 60;
                logic_delta = 0;

                this._cull_time = cull_delta / 60;
                cull_delta = 0;

                this._model_time = model_delta / 60;
                model_delta = 0;

                this._render_time = render_delta / 60;
                render_delta = 0;

                this._halt_time = halt_delta / 60;
                halt_delta = 0;
            }
        })
    }

    override update(dt: number): void {
        boot_time = boot_time || dt;

        if (this._time > 1) {
            this._fps = this._frames / this._time;
            this._frames = 1;
            this._time = dt;
        } else {
            this._frames++;
            this._time += dt;
        }

        this._text.impl.text = `FPS    ${this._fps.toFixed(2)}
logic  ${this._logic_time.toFixed(2)}ms
render ${this._render_time.toFixed(2)}ms
 halt  ${this._halt_time.toFixed(2)}ms
 model ${this._model_time.toFixed(2)}ms
 cull  ${this._cull_time.toFixed(2)}ms
 pass  ${Zero.instance.profile.passes}
 draw  ${Zero.instance.profile.draws}
boot   ${boot_time.toFixed(2)}s`;
    }
}