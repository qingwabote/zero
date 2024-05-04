import { now } from "boot";
import { Node, TextRenderer, Zero, render } from "engine";
import { ElementContainer } from "./ElementContainer.js";
import { Renderer } from "./Renderer.js";

let boot_time = 0;

export class Profiler extends ElementContainer {
    private _time: number = 0;
    private _frames: number = 0;

    private _fps: number = 0;

    private _logic_time = 0

    private _render_time = 0;

    private _model_time = 0;

    private _cull_time = 0;

    private _text!: Renderer<TextRenderer>;

    constructor(node: Node) {
        super(node);

        const text = Renderer.create(TextRenderer);
        this.addElement(text);
        this._text = text;

        this.profileLogic();
        this.profileRender();
    }

    override update(dt: number): void {
        boot_time = boot_time || dt;

        if (this._time > 1) {
            this._fps = this._frames / this._time;
            this._frames = 0;
            this._time = 0;
        }
        this._frames++;
        this._time += dt;

        this._text.impl.text = `FPS: ${this._fps.toFixed(2)}
draws: ${Zero.instance.profile.draws}
render: ${this._render_time.toFixed(2)}ms
    model: ${this._model_time.toFixed(2)}ms
    culling: ${this._cull_time.toFixed(2)}ms
    passes: ${Zero.instance.profile.stages}
logic: ${this._logic_time.toFixed(2)}ms
boot: ${boot_time.toFixed(2)}s`;
    }

    private profileLogic() {
        let time = 0;
        let delta = 0;
        let count = 0;
        Zero.instance.on(Zero.Event.LOGIC_START, () => {
            time = now();
        })
        Zero.instance.on(Zero.Event.LOGIC_END, () => {
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
        let cull_start = 0;
        let cull_delta = 0;
        let model_start = 0;
        let model_delta = 0
        let count = 0;
        Zero.instance.on(Zero.Event.RENDER_START, () => {
            time = now();
        })
        Zero.instance.profile.on(render.Profile.Event.CULL_START, () => {
            cull_start = now();
        })
        Zero.instance.profile.on(render.Profile.Event.CULL_END, () => {
            cull_delta += now() - cull_start;
        })
        Zero.instance.scene.event.on(render.Scene.Event.MODEL_UPDATE_START, () => {
            model_start = now();
        })
        Zero.instance.scene.event.on(render.Scene.Event.MODEL_UPDATE_END, () => {
            model_delta += now() - model_start;
        })
        Zero.instance.on(Zero.Event.RENDER_END, () => {
            delta += now() - time;
            count++;
            if (count == 60) {
                this._render_time = delta / count;
                delta = 0;
                this._model_time = model_delta / count;
                this._cull_time = cull_delta / count;
                cull_delta = 0;
                model_delta = 0;
                count = 0;
            }
        })
    }
}