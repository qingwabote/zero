import { now } from "boot";
import { TextRenderer, Zero, pipeline, render } from "engine";
import { ElementContainer } from "./ElementContainer.js";
import { Renderer } from "./Renderer.js";
let boot_time = 0;
export class Profiler extends ElementContainer {
    constructor(node) {
        super(node);
        this._time = 0;
        this._frames = 1;
        this._update_delta = 0;
        this._late_update_delta = 0;
        this._scene_update_delta = 0;
        this._pipeline_update_delta = 0;
        this._device_sync_delta = 0;
        this._upload_delta = 0;
        this._pipeline_batch_delta = 0;
        this._render_delta = 0;
        this._model_delta = 0;
        this._cull_delta = 0;
        this._pipeline_batch_upload_delta = 0;
        const text = Renderer.create(TextRenderer);
        text.impl.size = 24;
        text.impl.color = [0.8, 0.8, 0.8, 1];
        this.addElement(text);
        this._text = text;
        let cull_start = 0;
        let pipeline_batch_upload_start = 0;
        let model_start = 0;
        let time = 0;
        Zero.instance.on(Zero.Event.FRAME_START, () => { time = now(); });
        // Zero.instance.on(Zero.Event.UPDATE, () => { const t = now(); update_delta += t - time; time = t; })
        // Zero.instance.on(Zero.Event.LATE_UPDATE, () => { const t = now(); late_update_delta += t - time; time = t; })
        Zero.instance.on(Zero.Event.LATE_UPDATE, () => { const t = now(); this._update_delta += t - time; time = t; }); // update + late_update
        Zero.instance.on(Zero.Event.SCENE_UPDATE, () => { const t = now(); this._scene_update_delta += t - time; time = t; });
        Zero.instance.on(Zero.Event.PIPELINE_UPDATE, () => { const t = now(); this._pipeline_update_delta += t - time; time = t; });
        Zero.instance.on(Zero.Event.DEVICE_SYNC, () => { const t = now(); this._device_sync_delta += t - time; time = t; });
        Zero.instance.on(Zero.Event.UPLOAD, () => { const t = now(); this._upload_delta += t - time; time = t; });
        Zero.instance.on(Zero.Event.PIPELINE_BATCH, () => { const t = now(); this._pipeline_batch_delta += t - time; time = t; });
        Zero.instance.profile.on(pipeline.Profile.Event.CULL_START, () => { cull_start = now(); });
        Zero.instance.profile.on(pipeline.Profile.Event.CULL_END, () => { this._cull_delta += now() - cull_start; });
        Zero.instance.profile.on(pipeline.Profile.Event.BATCH_UPLOAD_START, () => { pipeline_batch_upload_start = now(); });
        Zero.instance.profile.on(pipeline.Profile.Event.BATCH_UPLOAD_END, () => { this._pipeline_batch_upload_delta += now() - pipeline_batch_upload_start; });
        Zero.instance.scene.event.on(render.Scene.Event.MODEL_UPDATE_START, () => { model_start = now(); });
        Zero.instance.scene.event.on(render.Scene.Event.MODEL_UPDATE_END, () => { this._model_delta += now() - model_start; });
        Zero.instance.on(Zero.Event.RENDER, () => { const t = now(); this._render_delta += t - time; time = t; });
        Zero.instance.on(Zero.Event.FRAME_END, () => {
            if (this._frames == 1) {
                this._update_delta = 0;
                this._late_update_delta = 0;
                this._scene_update_delta = 0;
                this._pipeline_update_delta = 0;
                this._device_sync_delta = 0;
                this._upload_delta = 0;
                this._pipeline_batch_delta = 0;
                this._render_delta = 0;
                this._cull_delta = 0;
                this._pipeline_batch_upload_delta = 0;
                this._model_delta = 0;
            }
        });
    }
    update(dt) {
        boot_time = boot_time || dt;
        if (this._time < 1) {
            this._frames++;
            this._time += dt;
            return;
        }
        this._text.impl.text = `FPS      ${(this._frames / this._time).toFixed(2)}
update   ${(this._update_delta / this._frames).toFixed(2)}ms`
            //             + `
            // late     ${(this._late_update_delta / this._frames).toFixed(2)}ms`
            + `
scene    ${(this._scene_update_delta / this._frames).toFixed(2)}ms
pipeline ${(this._pipeline_update_delta / this._frames).toFixed(2)}ms
 cull    ${(this._cull_delta / this._frames).toFixed(2)}ms
sync     ${(this._device_sync_delta / this._frames).toFixed(2)}ms
upload   ${(this._upload_delta / this._frames).toFixed(2)}ms
batch    ${(this._pipeline_batch_delta / this._frames).toFixed(2)}ms
 upload  ${(this._pipeline_batch_upload_delta / this._frames).toFixed(2)}ms
render   ${(this._render_delta / this._frames).toFixed(2)}ms
material ${Zero.instance.profile.materials}
pipeline ${Zero.instance.profile.pipelines}
draw     ${Zero.instance.profile.draws}`;
        //             + `
        // boot     ${boot_time.toFixed(2)}s`;
        this._frames = 1;
        this._time = dt;
    }
}
