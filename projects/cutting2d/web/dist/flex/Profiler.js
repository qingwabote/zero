import { now } from "boot";
import { TextRenderer, Zero, render } from "engine";
import { ElementContainer } from "./ElementContainer.js";
import { Renderer } from "./Renderer.js";
let boot_time = 0;
export class Profiler extends ElementContainer {
    constructor(node) {
        super(node);
        this._time = 0;
        this._frames = 1;
        this._fps = 0;
        this._update_average = 0;
        this._late_update_average = 0;
        this._scene_update_average = 0;
        this._pipeline_update_average = 0;
        this._halt_average = 0;
        this._gfx_average = 0;
        this._model_time = 0;
        this._cull_average = 0;
        const text = Renderer.create(TextRenderer);
        this.addElement(text);
        this._text = text;
        let time = 0;
        let update_delta = 0;
        let late_update_delta = 0;
        let scene_update_delta = 0;
        let pipeline_update_delta = 0;
        let halt_delta = 0;
        let gfx_delta = 0;
        let cull_start = 0;
        let cull_delta = 0;
        let model_start = 0;
        let model_delta = 0;
        Zero.instance.on(Zero.Event.FRAME_START, () => { time = now(); });
        // Zero.instance.on(Zero.Event.UPDATE, () => { const t = now(); update_delta += t - time; time = t; })
        // Zero.instance.on(Zero.Event.LATE_UPDATE, () => { const t = now(); late_update_delta += t - time; time = t; })
        Zero.instance.on(Zero.Event.LATE_UPDATE, () => { const t = now(); update_delta += t - time; time = t; });
        Zero.instance.on(Zero.Event.SCENE_UPDATE, () => { const t = now(); scene_update_delta += t - time; time = t; });
        Zero.instance.on(Zero.Event.PIPELINE_UPDATE, () => { const t = now(); pipeline_update_delta += t - time; time = t; });
        Zero.instance.on(Zero.Event.READY_TO_RENDER, () => { const t = now(); halt_delta += t - time; time = t; });
        Zero.instance.profile.on(render.Profile.Event.CULL_START, () => { cull_start = now(); });
        Zero.instance.profile.on(render.Profile.Event.CULL_END, () => { cull_delta += now() - cull_start; });
        Zero.instance.scene.event.on(render.Scene.Event.MODEL_UPDATE_START, () => { model_start = now(); });
        Zero.instance.scene.event.on(render.Scene.Event.MODEL_UPDATE_END, () => { model_delta += now() - model_start; });
        Zero.instance.on(Zero.Event.FRAME_END, () => {
            const t = now();
            gfx_delta += t - time;
            time = t;
            if (Zero.frameCount % 60 == 0) {
                this._update_average = update_delta / 60;
                update_delta = 0;
                this._late_update_average = late_update_delta / 60;
                late_update_delta = 0;
                this._scene_update_average = scene_update_delta / 60;
                scene_update_delta = 0;
                this._pipeline_update_average = pipeline_update_delta / 60;
                pipeline_update_delta = 0;
                this._halt_average = halt_delta / 60;
                halt_delta = 0;
                this._gfx_average = gfx_delta / 60;
                gfx_delta = 0;
                this._cull_average = cull_delta / 60;
                cull_delta = 0;
                this._model_time = model_delta / 60;
                model_delta = 0;
            }
        });
    }
    update(dt) {
        boot_time = boot_time || dt;
        if (this._time > 1) {
            this._fps = this._frames / this._time;
            this._frames = 1;
            this._time = dt;
        }
        else {
            this._frames++;
            this._time += dt;
        }
        this._text.impl.text = `FPS      ${this._fps.toFixed(2)}
update   ${this._update_average.toFixed(2)}ms`
            //             + `
            // late     ${this._late_update_average.toFixed(2)}ms`
            + `
scene    ${this._scene_update_average.toFixed(2)}ms
pipeline ${this._pipeline_update_average.toFixed(2)}ms
 cull    ${this._cull_average.toFixed(2)}ms
halt     ${this._halt_average.toFixed(2)}ms
gfx      ${this._gfx_average.toFixed(2)}ms
pass     ${Zero.instance.profile.passes}
pipeline ${Zero.instance.profile.pipelines}
draw     ${Zero.instance.profile.draws}`;
        //             + `
        // boot     ${boot_time.toFixed(2)}s`;
    }
}
