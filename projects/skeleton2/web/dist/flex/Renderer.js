import { BoundedRenderer, Node, vec3 } from "engine";
import { Element } from "./Element.js";
const vec3_a = vec3.create();
const vec3_b = vec3.create();
export class Renderer extends Element {
    static create(constructor) {
        const node = new Node(constructor.name);
        node.addComponent(constructor);
        return node.addComponent((Renderer));
    }
    get impl() {
        return this.node.getComponent(BoundedRenderer);
    }
    get bounds() {
        return this.impl.bounds;
    }
    constructor(node) {
        super(node);
        this.yg_node.deref().setMeasureFunc((width, widthMode, height, heightMode) => {
            const PIXELS_PER_UNIT = this.impl.constructor.PIXELS_PER_UNIT;
            const halfExtent = this.impl.bounds.halfExtent;
            return { width: halfExtent[0] * 2 * PIXELS_PER_UNIT, height: halfExtent[1] * 2 * PIXELS_PER_UNIT };
        });
        this.impl.on(BoundedRenderer.EventName.BOUNDS_CHANGED, () => {
            this.yg_node.deref().markDirty();
        });
    }
    layout_update() {
        const layout = this.yg_node.deref().getComputedLayout();
        // console.log('layout_update layout', this.node.name, layout)
        const bounds = this.impl.bounds;
        let offsetX = 0;
        let scaleX = 1;
        if (bounds.halfExtent[0]) {
            scaleX = layout.width / (bounds.halfExtent[0] * 2);
            offsetX = (bounds.halfExtent[0] - bounds.center[0]) * scaleX;
        }
        let offsetY = 0;
        let scaleY = 1;
        if (bounds.halfExtent[1]) {
            scaleY = layout.height / (bounds.halfExtent[1] * 2);
            offsetY = (bounds.halfExtent[1] + bounds.center[1]) * scaleY;
        }
        vec3.set(vec3_a, layout.left + offsetX, -(layout.top + offsetY), 0);
        this.node.position = vec3_a;
        vec3.set(vec3_b, scaleX, scaleY, 1);
        this.node.scale = vec3_b;
    }
}
