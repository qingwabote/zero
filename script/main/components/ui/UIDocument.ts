import Component from "../../core/Component.js";
import { InputEvent, Touch } from "../../core/Input.js";
import mat4 from "../../core/math/mat4.js";
import rect from "../../core/math/rect.js";
import vec2, { Vec2 } from "../../core/math/vec2.js";
import Node from "../../core/Node.js";
import Camera from "../Camera.js";
import UIElement, { UITouch, UITouchEvent, UITouchEventType } from "./internal/UIElement.js";
import UIContainer from "./UIContainer.js";

const vec2_a = vec2.create();
const mat4_a = mat4.create();

export default class UIDocument extends Component {
    static create() {
        const node = new Node(UIDocument.name);
        return node.addComponent(UIDocument);
    }

    constructor(node: Node) {
        super(node);
        zero.input.on(InputEvent.TOUCH_START, event => this.touchHandler(event.touches[0], UITouchEventType.TOUCH_START));
        zero.input.on(InputEvent.TOUCH_MOVE, event => this.touchHandler(event.touches[0], UITouchEventType.TOUCH_MOVE));
        zero.input.on(InputEvent.TOUCH_END, event => this.touchHandler(event.touches[0], UITouchEventType.TOUCH_END));
    }

    addElement(element: UIElement) {
        this.node.addChild(element.node);
    }

    private touchHandler(touch: Touch, event: UITouchEventType) {
        const cameras = Camera.instances;
        const world_positions: Vec2[] = [];
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            world_positions[i] = camera.screenToWorld(vec2.create(), touch.x, touch.y);
        }
        const children = this.node.children;
        for (let i = children.length - 1; i > -1; i--) {
            if (this.touchWalk(children[i], cameras, world_positions, event)) {
                return;
            }
        }
    }

    private touchWalk(node: Node, cameras: readonly Camera[], world_positions: readonly Vec2[], event: UITouchEventType) {
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (!(node.visibilityFlag & camera.visibilityFlags)) {
                continue;
            }
            const element = node.getComponent(UIElement);
            if (!element) {
                continue;
            }
            const world_position = world_positions[i];
            mat4.invert(mat4_a, node.world_matrix);
            vec2.transformMat4(vec2_a, world_position, mat4_a);
            const aabb = element.getBounds();
            if (!rect.contains(aabb, vec2_a)) {
                continue;
            }
            // capture
            // if (element.has(event)) {
            //     element.emit(event, new UITouchEvent(new UITouch(world_position, vec2_a)));
            // }
            if (element instanceof UIContainer) {
                const children = node.children;
                for (let j = children.length - 1; j > -1; j--) {
                    if (this.touchWalk(children[j], cameras, world_positions, event)) {
                        // bubbling
                        if (element.has(event)) {
                            element.emit(event, new UITouchEvent(new UITouch(world_position, vec2_a)));
                        }
                        return true;
                    }
                }
            }
            // target
            if (element.has(event)) {
                element.emit(event, new UITouchEvent(new UITouch(world_position, vec2_a)));
            }
            return true;
        }
        return false;
    }
}