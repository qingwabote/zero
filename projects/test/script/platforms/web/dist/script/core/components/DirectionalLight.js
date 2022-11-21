import Component from "../Component.js";
export default class DirectionalLight extends Component {
    start() {
        zero.renderScene.directionalLight = { node: this._node };
    }
}
//# sourceMappingURL=DirectionalLight.js.map