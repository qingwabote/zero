import Component from "../core/Component.js";
import Node from "../core/Node.js";
import { default as render_DirectionalLight } from "../core/scene/DirectionalLight.js";

export default class DirectionalLight extends Component {
    private _light: render_DirectionalLight;

    constructor(node: Node) {
        super(node);
        this._light = new render_DirectionalLight(node);
    }

    override start(): void {
        zero.scene.directionalLight = this._light;
    }
}