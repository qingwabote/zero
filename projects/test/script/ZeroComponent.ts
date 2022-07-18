import Component from "../../../script/core/Component.js";

export default class ZeroComponent extends Component {
    override start(): void {
        this._node.position = [0, 0, -20]
        // this._node.eulerX = 45;
        // this._node.eulerY = 45;
        // this._node.eulerZ = 45;
    }

    override update(dt: number): void {
        // this._node.eulerX += 0.2
        // this._node.eulerY += 0.2
        // this._node.eulerZ += 0.2
    }
}