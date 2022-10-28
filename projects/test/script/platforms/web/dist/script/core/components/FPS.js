import Component from "../Component.js";
import Label from "./Label.js";
export default class FPS extends Component {
    _time = 0;
    _frames = 0;
    start() {
    }
    update(dt) {
        const label = this._node.getComponent(Label);
        if (!label)
            return;
        const now = Date.now();
        const duration = now - this._time;
        if (duration > 1000) {
            const fps = this._frames * 1000 / duration;
            label.text = "FPS: " + fps;
            this._frames = 0;
            this._time = now;
        }
        this._frames++;
    }
}
//# sourceMappingURL=FPS.js.map