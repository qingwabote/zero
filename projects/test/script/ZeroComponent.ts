import Component from "../../../script/core/Component.js";
import vec3 from "../../../script/core/math/vec3.js";

export default class ZeroComponent extends Component {
    override start(): void {
        const scale = Object.assign(vec3.create(), this._node.scale);
        scale[0] *= 0.8;
        scale[1] *= 0.8;
        scale[2] *= 0.8;
        this._node.scale = scale;
        this._node.position = [0, 0, -10]
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