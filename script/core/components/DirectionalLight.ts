import Component from "../Component.js";

export default class DirectionalLight extends Component {
    override start(): void {
        zero.renderScene.directionalLight = { node: this._node };
    }
}