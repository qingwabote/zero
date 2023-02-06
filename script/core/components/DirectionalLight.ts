import Component from "../Component.js";
import RenderDirectionalLight from "../render/RenderDirectionalLight.js";

export default class DirectionalLight extends Component {
    private _light: RenderDirectionalLight = new RenderDirectionalLight;

    override start(): void {
        this.node.eventEmitter.on("TRANSFORM_CHANGED", (flags) => {
            this._light.position = this.node.world_position;
        });

        this._light.position = this.node.world_position;

        zero.renderScene.directionalLight = this._light;
    }
}