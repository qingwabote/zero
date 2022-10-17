import Component from "../Component.js";
import { ClearFlagBit } from "../gfx/Pipeline.js";
import { Rect } from "../math/rect.js";
import RenderCamera from "../render/RenderCamera.js";

export default class Camera extends Component {
    orthoHeight = -1;
    fov = -1;

    clearFlag: ClearFlagBit = ClearFlagBit.COLOR | ClearFlagBit.DEPTH;

    viewport: Rect = { x: 0, y: 0, width: 1, height: 1 };

    override start(): void {
        const camera = new RenderCamera(zero.window, this._node);
        camera.orthoHeight = this.orthoHeight;
        camera.fov = this.fov;
        camera.clearFlag = this.clearFlag;
        camera.viewport = this.viewport;
        zero.renderScene.cameras.push(camera);
    }
}