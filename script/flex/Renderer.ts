import { DeepReadonly } from "bastard";
import { AABB2D, BoundedRenderer, Node, vec3 } from "engine";
import { Element } from "./Element.js";
import * as yoga from "./yoga/index.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();

export class Renderer<T extends BoundedRenderer> extends Element {
    static create<T extends BoundedRenderer>(constructor: new (...args: ConstructorParameters<typeof BoundedRenderer>) => T): Renderer<T> {
        const node = new Node(constructor.name);
        node.addComponent(constructor);
        return node.addComponent(Renderer<T>);
    }

    get impl(): T {
        return this.node.getComponent(BoundedRenderer) as T;
    }

    override get bounds(): DeepReadonly<AABB2D> {
        return this.impl.bounds;
    }

    constructor(node: Node) {
        super(node);
        this.yg_node.deref().setMeasureFunc((width: number, widthMode: yoga.MeasureMode, height: number, heightMode: yoga.MeasureMode) => {
            const PIXELS_PER_UNIT = (this.impl.constructor as typeof BoundedRenderer).PIXELS_PER_UNIT;
            const halfExtent = this.impl.bounds.halfExtent;
            return { width: halfExtent[0] * 2 * PIXELS_PER_UNIT, height: halfExtent[1] * 2 * PIXELS_PER_UNIT };
        })
        this.impl.on(BoundedRenderer.EventName.BOUNDS_CHANGED, () => {
            this.yg_node.deref().markDirty();
        })
    }

    override layout_update(): void {
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