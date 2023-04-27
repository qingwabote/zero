import Node from "../../core/Node.js";
import aabb2d from "../../core/math/aabb2d.js";
import vec2, { Vec2 } from "../../core/math/vec2.js";
import vec3 from "../../core/math/vec3.js";
import UIElement, { UIBoundsEventType, UIEventToListener } from "./internal/UIElement.js";

const vec2_a = vec2.create();
const vec2_b = vec2.create();

const vec3_a = vec3.create();

const aabb2d_a = aabb2d.create();

export default class UIContainer<EventToListener extends UIEventToListener = UIEventToListener> extends UIElement<EventToListener> {
    private _content: Node;

    get elementCount(): number {
        return this._content.children.length;
    }

    private _layoutDirty = true;

    private _explicit_size?: Vec2;
    private _implicit_size = vec2.create();
    public override get size(): Readonly<Vec2> {
        if (this._explicit_size) {
            return this._explicit_size;
        }

        aabb2d.set(aabb2d_a, vec2.ZERO, vec2.ZERO);
        for (let i = 0; i < this.elementCount; i++) {
            const element = this.getElement(i);
            aabb2d.merge(aabb2d_a, aabb2d_a, element.getBoundsToParent());
        }
        return vec2.set(this._implicit_size, aabb2d_a.halfExtent[0] * 2, aabb2d_a.halfExtent[1] * 2);
    }
    public override set size(value: Readonly<Vec2>) {
        this._explicit_size = vec2.copy(this._explicit_size || vec2.create(), value);
        this._layoutDirty = true;
    }

    private _anchor: Readonly<Vec2> = vec2.create(0.5, 0.5);
    public get anchor() {
        return this._anchor;
    }
    public set anchor(value: Readonly<Vec2>) {
        vec2.copy(this._anchor, value)
        this._layoutDirty = true;
    }

    constructor(node: Node) {
        super(node);
        this._content = new Node('content');
        node.addChild(this._content);
    }

    getElement(index: number): UIElement {
        return this._content.children[index].getComponent(UIElement)!;
    }

    addElement(element: UIElement) {
        element.on(UIBoundsEventType.BOUNDS_CHANGED, () => this._layoutDirty = true);
        this._content.addChild(element.node);
    }

    override update(): void {
        if (this._layoutDirty) {

            aabb2d.set(aabb2d_a, vec2.ZERO, vec2.ZERO);
            for (let i = 0; i < this.elementCount; i++) {
                const element = this.getElement(i);
                aabb2d.merge(aabb2d_a, aabb2d_a, element.getBoundsToParent());
            }
            aabb2d.toPoints(vec2_a, vec2_b, aabb2d_a);
            const size = this.size;
            this._content.position = vec3.set(vec3_a, -size[0] * this.anchor[0] - vec2_a[0], -size[1] * this.anchor[1] - vec2_a[1], 0);

            this._layoutDirty = false;
        }
    }
}