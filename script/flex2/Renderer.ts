import { DeepReadonly } from "bastard";
import { AABB2D, BoundedRenderer, Node, vec3 } from "engine";
import { yoga } from "yoga";
import { Element } from "./Element.js";

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
        const f = yoga.heap.addFunction((args) => {
            const [size, node, width, widthMode, height, heightMode] = yoga.heap.getArgs(args, 'p', 'p', 'f32', 'i32', 'f32', 'i32');
            const PIXELS_PER_UNIT = (this.impl.constructor as typeof BoundedRenderer).PIXELS_PER_UNIT;
            const halfExtent = this.impl.bounds.halfExtent;
            yoga.fn.YGSizeSet(size, halfExtent[0] * 2 * PIXELS_PER_UNIT, halfExtent[1] * 2 * PIXELS_PER_UNIT)
        })
        yoga.fn.YGNodeSetMeasureFunc_PK(this.yg_node, f);

        this.impl.on(BoundedRenderer.EventName.BOUNDS_CHANGED, () => {
            yoga.fn.YGNodeMarkDirty(this.yg_node);
        })
    }

    override doLayout(): void {
        const left = yoga.fn.YGNodeLayoutGetLeft(this.yg_node);
        const top = yoga.fn.YGNodeLayoutGetTop(this.yg_node);
        const width = yoga.fn.YGNodeLayoutGetWidth(this.yg_node);
        const height = yoga.fn.YGNodeLayoutGetHeight(this.yg_node);

        const bounds = this.impl.bounds;

        let offsetX = 0;
        let scaleX = 1;
        if (bounds.halfExtent[0]) {
            scaleX = width / (bounds.halfExtent[0] * 2);
            offsetX = (bounds.halfExtent[0] - bounds.center[0]) * scaleX;
        }

        let offsetY = 0;
        let scaleY = 1;
        if (bounds.halfExtent[1]) {
            scaleY = height / (bounds.halfExtent[1] * 2);
            offsetY = (bounds.halfExtent[1] + bounds.center[1]) * scaleY;
        }

        vec3.set(vec3_a, left + offsetX, -(top + offsetY), 0);
        this.node.position = vec3_a;
        vec3.set(vec3_b, scaleX, scaleY, 1);
        this.node.scale = vec3_b;
    }
}