import { Component } from "../core/Component.js";
import { Node } from "../core/Node.js";
import { Zero } from "../core/Zero.js";
import { DirectionalLight as render_DirectionalLight } from "../core/render/scene/DirectionalLight.js";

export class DirectionalLight extends Component {
    private _light: render_DirectionalLight;

    constructor(node: Node) {
        super(node);
        this._light = new render_DirectionalLight(node);
    }

    override start(): void {
        Zero.instance.scene.directionalLight = this._light;
    }
}