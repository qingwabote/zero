import { BoundedRenderer, GestureEventName, TouchEventName, Zero, aabb2d, mat4, vec2 } from "engine";
import { Element } from "./Element.js";
import { ElementContainer } from "./ElementContainer.js";
import { LayoutSystem } from "./LayoutSystem.js";
const mat4_a = mat4.create();
export class Document extends ElementContainer {
    constructor(node) {
        super(node);
        this._touchClaimed = new Map;
        Zero.instance.input.on(TouchEventName.START, event => {
            this.eventHandler(event, TouchEventName.START);
        });
        Zero.instance.input.on(TouchEventName.END, event => {
            for (const element of this._touchClaimed.keys()) {
                if (element.emitter.has(TouchEventName.END)) {
                    element.emitter.emit(TouchEventName.END);
                }
            }
            this._touchClaimed.clear();
        });
        Zero.instance.input.on(TouchEventName.MOVE, event => this.eventHandler(event, TouchEventName.MOVE));
        Zero.instance.input.on(GestureEventName.PINCH, event => this.eventHandler(event, GestureEventName.PINCH));
        LayoutSystem.instance.addRoot(this.yg_node);
    }
    lateUpdate() {
        this.orderWalk(this.node, 0);
    }
    orderWalk(node, order) {
        const renderer = node.getComponent(BoundedRenderer);
        if (renderer) {
            renderer.order = order++;
        }
        for (const child of node.children) {
            order = this.orderWalk(child, order++);
        }
        return order;
    }
    eventHandler(event, name) {
        const cameras = Zero.instance.scene.cameras;
        const world_positions = [];
        for (let i = 0; i < cameras.length; i++) {
            world_positions[i] = cameras[i].screenToWorld(vec2.create(), event.x(0), event.y(0));
        }
        const children = this.node.children;
        for (let i = children.length - 1; i > -1; i--) {
            if (this.touchWalk(children[i].getComponent(Element), cameras, world_positions, name, event)) {
                return;
            }
        }
    }
    touchWalk(element, cameras, world_positions, name, event) {
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (!(element.node.visibility & camera.visibilities)) {
                continue;
            }
            const isContainer = element instanceof ElementContainer;
            if (!isContainer && !element.emitter.has(name)) {
                continue;
            }
            if (name == TouchEventName.MOVE && !this._touchClaimed.has(element)) {
                continue;
            }
            // hit test
            const world_position = world_positions[i];
            mat4.invert(mat4_a, element.node.world_matrix);
            const local_position = vec2.transformMat4(vec2.create(), world_position, mat4_a);
            if (!aabb2d.contains(element.bounds, local_position)) {
                continue;
            }
            // capture
            // if (element.has(event)) {
            //     element.emit(event, new UITouchEvent(new UITouch(world_position, local_position)));
            // }
            if (isContainer) {
                const children = element.node.children;
                for (let j = children.length - 1; j > -1; j--) {
                    if (this.touchWalk(children[j].getComponent(Element), cameras, world_positions, name, event)) {
                        // bubbling
                        if (element.emitter.has(name)) {
                            element.emitter.emit(name, Object.assign({ touch: { world: world_position, local: local_position } }, name == GestureEventName.PINCH && { delta: event.delta }));
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
                element.emitter.emit(name, Object.assign({ touch: { world: world_position, local: local_position } }, name == GestureEventName.PINCH && { delta: event.delta }));
            }
            if (name == TouchEventName.START) {
                this._touchClaimed.set(element, element);
            }
            return true;
        }
        return false;
    }
    layout_update() { }
}