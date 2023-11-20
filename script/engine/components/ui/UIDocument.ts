import { Touch } from "boot";
import { Component } from "../../core/Component.js";
import { InputEventType } from "../../core/Input.js";
import { Node } from "../../core/Node.js";
import { Zero } from "../../core/Zero.js";
import { aabb2d } from "../../core/math/aabb2d.js";
import { mat4 } from "../../core/math/mat4.js";
import { Vec2, vec2 } from "../../core/math/vec2.js";
import { Camera } from "../Camera.js";
import { ModelRenderer } from "../internal/ModelRenderer.js";
import { UIContainer } from "./UIContainer.js";
import { UIElement, UITouchEventType } from "./UIElement.js";

const mat4_a = mat4.create();

export class UIDocument extends Component {
    private _touchClaimed: Map<UIElement, UIElement> = new Map;

    constructor(node: Node) {
        super(node);
        Zero.instance.input.on(InputEventType.TOUCH_START, event => {
            this._touchClaimed.clear();
            this.touchHandler(event.touches[0], UITouchEventType.TOUCH_START);
        });
        Zero.instance.input.on(InputEventType.TOUCH_MOVE, event => this.touchHandler(event.touches[0], UITouchEventType.TOUCH_MOVE));
        Zero.instance.input.on(InputEventType.TOUCH_END, event => this.touchHandler(event.touches[0], UITouchEventType.TOUCH_END));
    }

    override lateUpdate(): void {
        this.orderWalk(this.node, 0);
    }

    addElement(element: UIElement) {
        this.node.addChild(element.node);
    }

    private orderWalk(node: Node, order: number): number {
        const renderer = node.getComponent(ModelRenderer);
        if (renderer) {
            renderer.order = order++;
        }
        for (const child of node.children) {
            order = this.orderWalk(child, order++)
        }
        return order;
    }

    private touchHandler(touch: Touch, type: UITouchEventType) {
        const cameras = Camera.instances;
        const world_positions: Vec2[] = [];
        for (let i = 0; i < cameras.length; i++) {
            world_positions[i] = cameras[i].screenToWorld(vec2.create(), touch.x, touch.y);
        }
        const children = this.node.children;
        for (let i = children.length - 1; i > -1; i--) {
            if (this.touchWalk(children[i].getComponent(UIElement)!, cameras, world_positions, type)) {
                return;
            }
        }
    }

    private touchWalk(element: UIElement, cameras: readonly Camera[], world_positions: readonly Readonly<Vec2>[], type: UITouchEventType) {
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (!(element.node.visibilityFlag & camera.visibilityFlags)) {
                continue;
            }

            const isContainer = element instanceof UIContainer;
            if (!isContainer && !element.has(type)) {
                continue;
            }

            if (type != UITouchEventType.TOUCH_START && !this._touchClaimed.has(element)) {
                continue;
            }

            // hit test
            const world_position = world_positions[i];
            mat4.invert(mat4_a, element.node.world_matrix);
            const local_position: Readonly<Vec2> = vec2.transformMat4(vec2.create(), world_position, mat4_a);
            if (!aabb2d.contains(element.getBoundsOnTouch(), local_position)) {
                continue;
            }
            // capture
            // if (element.has(event)) {
            //     element.emit(event, new UITouchEvent(new UITouch(world_position, local_position)));
            // }
            if (isContainer) {
                for (let j = element.elementCount - 1; j > -1; j--) {
                    if (this.touchWalk(element.getElement(j), cameras, world_positions, type)) {
                        // bubbling
                        if (element.has(type)) {
                            element.emit(type, { touch: { world: world_position, local: local_position } });
                        }
                        if (type == UITouchEventType.TOUCH_START) {
                            this._touchClaimed.set(element, element);
                        }
                        return true;
                    }
                }
            }
            // target
            if (element.has(type)) {
                element.emit(type, { touch: { world: world_position, local: local_position } });
            }
            if (type == UITouchEventType.TOUCH_START) {
                this._touchClaimed.set(element, element);
            }
            return true;
        }
        return false;
    }
}