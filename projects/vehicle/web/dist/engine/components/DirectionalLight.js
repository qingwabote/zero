import { Component } from "../core/Component.js";
import { Zero } from "../core/Zero.js";
import { DirectionalLight as render_DirectionalLight } from "../core/render/scene/DirectionalLight.js";
export class DirectionalLight extends Component {
    constructor(node) {
        super(node);
        this._light = new render_DirectionalLight(node);
    }
    start() {
        Zero.instance.scene.directionalLight = this._light;
    }
}
