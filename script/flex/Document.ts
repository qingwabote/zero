import { SmartRef } from "bastard";
import { Touch } from "boot";
import { BoundedRenderer, Camera, InputEventType, Node, Vec2, Zero, aabb2d, mat4, vec2 } from "engine";
import { Element } from "./Element.js";
import { ElementContainer } from "./ElementContainer.js";
import { LayoutSystem } from "./LayoutSystem.js";
import * as yoga from "./yoga/index.js";

const mat4_a = mat4.create();

export class Document extends ElementContainer {
    private _touchClaimed: Map<Element, Element> = new Map;

    constructor(node: Node) {
        super(node);
        Zero.instance.input.on(InputEventType.TOUCH_START, event => {
            this._touchClaimed.clear();
            this.touchHandler(event.touches[0], InputEventType.TOUCH_START);
        });
        Zero.instance.input.on(InputEventType.TOUCH_MOVE, event => this.touchHandler(event.touches[0], InputEventType.TOUCH_MOVE));
        Zero.instance.input.on(InputEventType.TOUCH_END, event => this.touchHandler(event.touches[0], InputEventType.TOUCH_END));

        LayoutSystem.instance.addRoot(this.yg_node);
    }

    override lateUpdate(): void {
        this.orderWalk(this.node, 0);
    }

    private orderWalk(node: Node, order: number): number {
        const renderer = node.getComponent(BoundedRenderer);
        if (renderer) {
            renderer.order = order++;
        }
        for (const child of node.children) {
            order = this.orderWalk(child, order++)
        }
        return order;
    }

    private touchHandler(touch: Touch, type: InputEventType) {
        const cameras = Camera.instances;
        const world_positions: Vec2[] = [];
        for (let i = 0; i < cameras.length; i++) {
            world_positions[i] = cameras[i].screenToWorld(vec2.create(), touch.x, touch.y);
        }
        const children = this.node.children;
        for (let i = children.length - 1; i > -1; i--) {
            if (this.touchWalk(children[i].getComponent(Element)!, cameras, world_positions, type)) {
                return;
            }
        }
    }

    private touchWalk(element: Element, cameras: readonly Camera[], world_positions: readonly Readonly<Vec2>[], type: InputEventType) {
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (!(element.node.visibility & camera.visibilities)) {
                continue;
            }

            const isContainer = element instanceof ElementContainer;
            if (!isContainer && !element.emitter.has(type)) {
                continue;
            }

            if (type != InputEventType.TOUCH_START && !this._touchClaimed.has(element)) {
                continue;
            }

            // hit test
            const world_position = world_positions[i];
            mat4.invert(mat4_a, element.node.world_matrix);
            const local_position: Readonly<Vec2> = vec2.transformMat4(vec2.create(), world_position, mat4_a);
            if (!aabb2d.contains(element.bounds, local_position)) {
                continue;
            }
            // capture
            // if (element.has(event)) {
            //     element.emit(event, new UITouchEvent(new UITouch(world_position, local_position)));
            // }
            if (isContainer) {
                const children = element.node.children
                for (let j = children.length - 1; j > -1; j--) {
                    if (this.touchWalk(children[j].getComponent(Element)!, cameras, world_positions, type)) {
                        // bubbling
                        if (element.emitter.has(type)) {
                            element.emitter.emit(type, { touch: { world: world_position, local: local_position } });
                        }
                        if (type == InputEventType.TOUCH_START) {
                            this._touchClaimed.set(element, element);
                        }
                        return true;
                    }
                }
            }
            // target
            if (element.emitter.has(type)) {
                element.emitter.emit(type, { touch: { world: world_position, local: local_position } });
            }
            if (type == InputEventType.TOUCH_START) {
                this._touchClaimed.set(element, element);
            }
            return true;
        }
        return false;
    }

    protected override layout_update(yg_node: SmartRef<yoga.Node>): void { }
}