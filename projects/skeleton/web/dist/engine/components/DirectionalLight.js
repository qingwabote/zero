import { Component } from "../core/Component.js";
import { DirectionalLight as render_DirectionalLight } from "../core/render/scene/DirectionalLight.js";
export class DirectionalLight extends Component {
    constructor() {
        super(...arguments);
        this._light = new render_DirectionalLight(this.node);
    }
    get emitter() {
        return this._light.emitter;
    }
    get shadows() {
        return this._light.shadows;
    }
    get shadow_cameras() {
        return this._light.shadow_cameras;
    }
}
DirectionalLight.Event = render_DirectionalLight.Event;
