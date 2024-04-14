import { Component } from "../core/Component.js";
import { DirectionalLight as render_DirectionalLight } from "../core/render/scene/DirectionalLight.js";
import { DirectionalLightFurstum } from "../core/render/scene/DirectionalLightFurstum.js";

export class DirectionalLight extends Component {
    static readonly Event = render_DirectionalLight.Event;

    public get emitter() {
        return this._light.emitter;
    }

    private _light: render_DirectionalLight = new render_DirectionalLight(this.node);

    public get shadows(): Readonly<Record<number, DirectionalLightFurstum>> {
        return this._light.shadows;
    }

    public get shadow_cameras(): readonly number[] {
        return this._light.shadow_cameras;
    }
}