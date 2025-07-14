import { now } from "boot";
import { Node, TextRenderer, Vec4, Zero } from "engine";
import { ElementContainer } from "./ElementContainer.js";
import { Renderer } from "./Renderer.js";

export class Profiler extends ElementContainer {
    private _time: number = 0;
    private _frames: number = 1;

    private _update_delta = 0;
    private _late_update_delta = 0;
    private _scene_update_delta = 0;
    private _pipeline_update_delta = 0;
    private _scene_cull_delta = 0;
    private _pipeline_batch_delta = 0;
    private _device_sync_delta = 0;
    private _render_delta = 0;

    private _text!: Renderer<TextRenderer>;

    public get color(): Readonly<Vec4> {
        return this._text.impl.color;
    }
    public set color(value: Readonly<Vec4>) {
        this._text.impl.color = value;
    }

    constructor(node: Node) {
        super(node);

        const text = Renderer.create(TextRenderer);
        text.impl.size = 24;
        this.addElement(text);
        this._text = text;

        let time = 0;
        Zero.instance.on(Zero.Event.FRAME_START, () => { time = now(); })
        // Zero.instance.on(Zero.Event.UPDATE, () => { const t = now(); update_delta += t - time; time = t; })
        // Zero.instance.on(Zero.Event.LATE_UPDATE, () => { const t = now(); late_update_delta += t - time; time = t; })
        Zero.instance.on(Zero.Event.LATE_UPDATE, () => { const t = now(); this._update_delta += t - time; time = t; }) // update + late_update
        Zero.instance.on(Zero.Event.SCENE_UPDATE, () => { const t = now(); this._scene_update_delta += t - time; time = t; })
        Zero.instance.on(Zero.Event.PIPELINE_UPDATE, () => { const t = now(); this._pipeline_update_delta += t - time; time = t; })
        Zero.instance.on(Zero.Event.SCENE_CULL, () => { const t = now(); this._scene_cull_delta += t - time; time = t; })
        Zero.instance.on(Zero.Event.PIPELINE_BATCH, () => { const t = now(); this._pipeline_batch_delta += t - time; time = t; })
        Zero.instance.on(Zero.Event.DEVICE_SYNC, () => { const t = now(); this._device_sync_delta += t - time; time = t; })

        Zero.instance.on(Zero.Event.RENDER, () => { const t = now(); this._render_delta += t - time; time = t; })

        Zero.instance.on(Zero.Event.FRAME_END, () => {
            if (this._frames == 1) {
                this._update_delta = 0;
                this._late_update_delta = 0;
                this._scene_update_delta = 0;
                this._pipeline_update_delta = 0;
                this._scene_cull_delta = 0;
                this._pipeline_batch_delta = 0;
                this._device_sync_delta = 0;
                this._render_delta = 0;
            }
        })
    }

    override update(dt: number): void {
        if (this._time < 1) {
            this._frames++;
            this._time += dt;
            return;
        }

        this._text.impl.text = `FPS      ${(this._frames / this._time).toFixed(2)}
update   ${(this._update_delta / this._frames).toFixed(2)}ms
scene    ${(this._scene_update_delta / this._frames).toFixed(2)}ms
cull     ${(this._scene_cull_delta / this._frames).toFixed(2)}ms
batch    ${(this._pipeline_batch_delta / this._frames).toFixed(2)}ms
sync     ${(this._device_sync_delta / this._frames).toFixed(2)}ms
render   ${(this._render_delta / this._frames).toFixed(2)}ms
material ${Zero.instance.profile.materials}
pipeline ${Zero.instance.profile.pipelines}
draw     ${Zero.instance.profile.draws}`

        this._frames = 1;
        this._time = dt;
    }
}