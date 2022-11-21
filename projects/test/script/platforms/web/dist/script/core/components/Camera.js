import Component from "../Component.js";
import { ClearFlagBit } from "../gfx/Pipeline.js";
import RenderCamera from "../render/RenderCamera.js";
import { PhaseBit } from "../render/RenderPhase.js";
import VisibilityBit from "../render/VisibilityBit.js";
export default class Camera extends Component {
    orthoHeight = -1;
    fov = -1;
    near = 1;
    far = 1000;
    visibilities = VisibilityBit.DEFAULT;
    phases = PhaseBit.DEFAULT;
    clearFlags = ClearFlagBit.COLOR | ClearFlagBit.DEPTH;
    viewport = { x: 0, y: 0, width: 0, height: 0 };
    start() {
        const camera = new RenderCamera(zero.window, this._node);
        camera.orthoHeight = this.orthoHeight;
        camera.fov = this.fov;
        camera.near = this.near;
        camera.far = this.far;
        camera.visibilities = this.visibilities;
        camera.phases = this.phases;
        camera.clearFlags = this.clearFlags;
        camera.viewport = this.viewport;
        zero.renderScene.cameras.push(camera);
    }
}
//# sourceMappingURL=Camera.js.map