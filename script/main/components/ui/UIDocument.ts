import Component from "../../core/Component.js";
import { InputEvent, Touch } from "../../core/Input.js";
import aabb2d from "../../core/math/aabb2d.js";
import mat4 from "../../core/math/mat4.js";
import vec2, { Vec2 } from "../../core/math/vec2.js";
import Node from "../../core/Node.js";
import Camera from "../Camera.js";
import ModelRenderer from "../internal/ModelRenderer.js";
import UIElement, { UITouchEventType } from "./internal/UIElement.js";
import UIContainer from "./UIContainer.js";

const mat4_a = mat4.create();

export default class UIDocument extends Component {
    private _touchClaimed: Map<UIElement, UIElement> = new Map;

    constructor(node: Node) {
        super(node);
        zero.input.on(InputEvent.TOUCH_START, event => {
            this._touchClaimed.clear();
            this.touchHandler(event.touches[0], UITouchEventType.TOUCH_START);
        });
        zero.input.on(InputEvent.TOUCH_MOVE, event => this.touchHandler(event.touches[0], UITouchEventType.TOUCH_MOVE));
        zero.input.on(InputEvent.TOUCH_END, event => this.touchHandler(event.touches[0], UITouchEventType.TOUCH_END));
    }

    override lateUpdate(): void {
        this.orderWalk(this.node, 0);
    }

    addElement(element: UIElement) {
        this.node.addChild(element.node);
    }

    private orderWalk(node: Node, order: number): number {
        const renderer = node.getComponent(ModelRenderer);
        if (renderer?.model) {
            renderer.model.order = order++;
        }
        for (const child of node.children) {
            order = this.orderWalk(child, order++)
        }
        return order;
    }

    private touchHandler(touch: Touch, event: UITouchEventType) {
        const cameras = Camera.instances;
        const world_positions: Vec2[] = [];
        for (let i = 0; i < cameras.length; i++) {
            world_positions[i] = cameras[i].screenToWorld(vec2.create(), touch.x, touch.y);
        }
        const children = this.node.children;
        for (let i = children.length - 1; i > -1; i--) {
            if (this.touchWalk(children[i].getComponent(UIElement)!, cameras, world_positions, event)) {
                return;
            }
        }
    }

    private touchWalk(element: UIElement, cameras: readonly Camera[], world_positions: readonly Readonly<Vec2>[], event: UITouchEventType) {
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (!(element.node.visibilityFlag & camera.visibilityFlags)) {
                continue;
            }

            if (event != UITouchEventType.TOUCH_START) {
                if (!this._touchClaimed.has(element)) {
                    continue;
                }
            }

            const world_position = world_positions[i];
            mat4.invert(mat4_a, element.node.world_matrix);
            const local_position: Readonly<Vec2> = vec2.transformMat4(vec2.create(), world_position, mat4_a);
            if (!aabb2d.contains(element.getBounds(), local_position)) {
                continue;
            }
            // capture
            // if (element.has(event)) {
            //     element.emit(event, new UITouchEvent(new UITouch(world_position, local_position)));
            // }
            if (element instanceof UIContainer) {
                for (let j = element.elementCount - 1; j > -1; j--) {
                    if (this.touchWalk(element.getElement(j), cameras, world_positions, event)) {
                        // bubbling
                        if (element.has(event)) {
                            element.emit(event, { touch: { world: world_position, local: local_position } });
                        }
                        if (event == UITouchEventType.TOUCH_START) {
                            this._touchClaimed.set(element, element);
                        }
                        return true;
                    }
                }
            }
            // target
            if (element.has(event)) {
                element.emit(event, { touch: { world: world_position, local: local_position } });
            }
            if (event == UITouchEventType.TOUCH_START) {
                this._touchClaimed.set(element, element);
            }
            return true;
        }
        return false;
    }
}