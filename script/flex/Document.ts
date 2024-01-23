import { SmartRef } from "bastard";
import { GestureEvent, TouchEvent } from "boot";
import { BoundedRenderer, Camera, Node, TouchEventName, Vec2, Zero, aabb2d, mat4, vec2 } from "engine";
import { Element } from "./Element.js";
import { ElementContainer } from "./ElementContainer.js";
import { LayoutSystem } from "./LayoutSystem.js";
import * as yoga from "./yoga/index.js";

const mat4_a = mat4.create();

export class Document extends ElementContainer {
    private _touchClaimed: Map<Element, Element> = new Map;

    constructor(node: Node) {
        super(node);
        Zero.instance.input.on(TouchEventName.START, event => {
            this._touchClaimed.clear();
            this.eventHandler(event, TouchEventName.START);
        });
        Zero.instance.input.on(TouchEventName.MOVE, event => this.eventHandler(event, TouchEventName.MOVE));
        Zero.instance.input.on(TouchEventName.END, event => this.eventHandler(event, TouchEventName.END));
        Zero.instance.input.on(TouchEventName.PINCH, event => this.eventHandler(event, TouchEventName.PINCH));

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

    private eventHandler(event: TouchEvent, name: TouchEventName) {
        const cameras = Camera.instances;
        const world_positions: Vec2[] = [];
        for (let i = 0; i < cameras.length; i++) {
            world_positions[i] = cameras[i].screenToWorld(vec2.create(), event.touches[0].x, event.touches[0].y);
        }
        const children = this.node.children;
        for (let i = children.length - 1; i > -1; i--) {
            if (this.touchWalk(children[i].getComponent(Element)!, cameras, world_positions, name, event)) {
                return;
            }
        }
    }

    private touchWalk(element: Element, cameras: readonly Camera[], world_positions: readonly Readonly<Vec2>[], name: TouchEventName, event: TouchEvent) {
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (!(element.node.visibility & camera.visibilities)) {
                continue;
            }

            const isContainer = element instanceof ElementContainer;
            if (!isContainer && !element.emitter.has(name)) {
                continue;
            }

            if ((name == TouchEventName.MOVE || name == TouchEventName.END) && !this._touchClaimed.has(element)) {
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
                    if (this.touchWalk(children[j].getComponent(Element)!, cameras, world_positions, name, event)) {
                        // bubbling
                        if (element.emitter.has(name)) {
                            element.emitter.emit(name, { touch: { world: world_position, local: local_position }, ...name == TouchEventName.PINCH && { delta: (event as GestureEvent).delta } });
                        }
                        if (name == TouchEventName.START) {
                            this._touchClaimed.set(element, element);
                        }
                        return true;
                    }
                }
            }
            // target
            if (element.emitter.has(name)) {
                element.emitter.emit(name, { touch: { world: world_position, local: local_position }, ...name == TouchEventName.PINCH && { delta: (event as GestureEvent).delta } });
            }
            if (name == TouchEventName.START) {
                this._touchClaimed.set(element, element);
            }
            return true;
        }
        return false;
    }

    protected override layout_update(yg_node: SmartRef<yoga.Node>): void { }
}