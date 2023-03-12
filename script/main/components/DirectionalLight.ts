import Component from "../core/Component.js";
import { default as render_DirectionalLight } from "../core/scene/DirectionalLight.js";

export default class DirectionalLight extends Component {
    private _light: render_DirectionalLight = new render_DirectionalLight;

    override start(): void {
        this.node.eventEmitter.on("TRANSFORM_CHANGED", (flags) => {
            this._light.position = this.node.world_position;
        });

        this._light.position = this.node.world_position;

        zero.scene.directionalLight = this._light;
    }
}