import Component from "../Component.js";
import game from "../game.js";
import RenderCamera from "../render/RenderCamera.js";
export default class Camera extends Component {
    orthoHeight = -1;
    fov = -1;
    viewport = { x: 0, y: 0, width: 1, height: 1 };
    start() {
        const camera = new RenderCamera(game.window, this._node);
        camera.orthoHeight = this.orthoHeight;
        camera.fov = this.fov;
        camera.viewport = this.viewport;
        game.renderScene.cameras.push(camera);
    }
}
//# sourceMappingURL=Camera.js.map