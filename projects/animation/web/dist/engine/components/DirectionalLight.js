import { Component } from "../core/Component.js";
import { DirectionalLight as render_DirectionalLight } from "../core/render/scene/DirectionalLight.js";
export class DirectionalLight extends Component {
    constructor() {
        super(...arguments);
        this._light = new render_DirectionalLight(this.node);
    }
}