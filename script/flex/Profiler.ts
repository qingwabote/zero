import { now } from "boot";
import { Node, TextRenderer, Zero, render } from "engine";
import { ElementContainer } from "./ElementContainer.js";
import { Renderer } from "./Renderer.js";

let boot_time = 0;

export class Profiler extends ElementContainer {
    private _time: number = 0;
    private _frames: number = 1;

    private _fps: number = 0;

    private _update_average = 0;
    private _late_update_average = 0;
    private _scene_update_average = 0;
    private _pipeline_update_average = 0;
    private _device_sync_average = 0;
    private _upload_average = 0;
    private _pipeline_batch_average = 0;
    private _render_average = 0;

    private _model_time = 0;

    private _cull_average = 0;

    private _pipeline_batch_upload_average = 0;

    private _text!: Renderer<TextRenderer>;

    constructor(node: Node) {
        super(node);

        const text = Renderer.create(TextRenderer);
        text.impl.size = 24;
        text.impl.color = [0.8, 0.8, 0.8, 1];
        this.addElement(text);
        this._text = text;

        let time = 0;
        let update_delta = 0;
        let late_update_delta = 0;
        let scene_update_delta = 0;
        let pipeline_update_delta = 0;
        let device_sync_delta = 0;
        let upload_delta = 0;
        let pipeline_batch_delta = 0;
        let render_delta = 0;

        let cull_start = 0;
        let cull_delta = 0;

        let pipeline_batch_upload_start = 0;
        let pipeline_batch_upload_delta = 0;

        let model_start = 0;
        let model_delta = 0

        Zero.instance.on(Zero.Event.FRAME_START, () => { time = now(); })
        // Zero.instance.on(Zero.Event.UPDATE, () => { const t = now(); update_delta += t - time; time = t; })
        // Zero.instance.on(Zero.Event.LATE_UPDATE, () => { const t = now(); late_update_delta += t - time; time = t; })
        Zero.instance.on(Zero.Event.LATE_UPDATE, () => { const t = now(); update_delta += t - time; time = t; }) // update + late_update
        Zero.instance.on(Zero.Event.SCENE_UPDATE, () => { const t = now(); scene_update_delta += t - time; time = t; })
        Zero.instance.on(Zero.Event.PIPELINE_UPDATE, () => { const t = now(); pipeline_update_delta += t - time; time = t; })
        Zero.instance.on(Zero.Event.DEVICE_SYNC, () => { const t = now(); device_sync_delta += t - time; time = t; })
        Zero.instance.on(Zero.Event.UPLOAD, () => { const t = now(); upload_delta += t - time; time = t; })
        Zero.instance.on(Zero.Event.PIPELINE_BATCH, () => { const t = now(); pipeline_batch_delta += t - time; time = t; })

        Zero.instance.profile.on(render.Profile.Event.CULL_START, () => { cull_start = now(); })
        Zero.instance.profile.on(render.Profile.Event.CULL_END, () => { cull_delta += now() - cull_start; })

        Zero.instance.profile.on(render.Profile.Event.BATCH_UPLOAD_START, () => { pipeline_batch_upload_start = now(); })
        Zero.instance.profile.on(render.Profile.Event.BATCH_UPLOAD_END, () => { pipeline_batch_upload_delta += now() - pipeline_batch_upload_start; })

        Zero.instance.scene.event.on(render.Scene.Event.MODEL_UPDATE_START, () => { model_start = now(); })
        Zero.instance.scene.event.on(render.Scene.Event.MODEL_UPDATE_END, () => { model_delta += now() - model_start; })

        Zero.instance.on(Zero.Event.FRAME_END, () => {
            const t = now(); render_delta += t - time; time = t;

            if (Zero.frameCount % 60 == 0) {
                this._update_average = update_delta / 60;
                update_delta = 0;

                this._late_update_average = late_update_delta / 60;
                late_update_delta = 0;

                this._scene_update_average = scene_update_delta / 60;
                scene_update_delta = 0;

                this._pipeline_update_average = pipeline_update_delta / 60;
                pipeline_update_delta = 0;

                this._device_sync_average = device_sync_delta / 60;
                device_sync_delta = 0;

                this._upload_average = upload_delta / 60;
                upload_delta = 0;

                this._pipeline_batch_average = pipeline_batch_delta / 60;
                pipeline_batch_delta = 0;

                this._render_average = render_delta / 60;
                render_delta = 0;

                this._cull_average = cull_delta / 60;
                cull_delta = 0;

                this._pipeline_batch_upload_average = pipeline_batch_upload_delta / 60;
                pipeline_batch_upload_delta = 0;

                this._model_time = model_delta / 60;
                model_delta = 0;
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

        this._text.impl.text = `FPS      ${this._fps.toFixed(2)}
update   ${this._update_average.toFixed(2)}ms`
            //             + `
            // late     ${this._late_update_average.toFixed(2)}ms`
            + `
scene    ${this._scene_update_average.toFixed(2)}ms
pipeline ${this._pipeline_update_average.toFixed(2)}ms
 cull    ${this._cull_average.toFixed(2)}ms
sync     ${this._device_sync_average.toFixed(2)}ms
upload   ${this._upload_average.toFixed(2)}ms
batch    ${this._pipeline_batch_average.toFixed(2)}ms
 upload  ${this._pipeline_batch_upload_average.toFixed(2)}ms
render   ${this._render_average.toFixed(2)}ms
material ${Zero.instance.profile.materials}
pipeline ${Zero.instance.profile.pipelines}
draw     ${Zero.instance.profile.draws}`
        //             + `
        // boot     ${boot_time.toFixed(2)}s`;
    }
}