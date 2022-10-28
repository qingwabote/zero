import Component from "../Component.js";
import vec3 from "../math/vec3.js";
export default class DirectionalLight extends Component {
    start() {
        zero.renderScene.directionalLight = { direction: vec3.normalize(vec3.create(), vec3.create(-1, 1, 1)) };
    }
}
//# sourceMappingURL=DirectionalLight.js.map