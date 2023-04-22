import Node from "../../core/Node.js";
import rect, { Rect } from "../../core/math/rect.js";
import vec2, { Vec2 } from "../../core/math/vec2.js";
import vec3 from "../../core/math/vec3.js";
import UIElement, { UIEventToListener } from "./internal/UIElement.js";

const rect_a = rect.create();

export default class UIContainer<EventToListener extends UIEventToListener = UIEventToListener> extends UIElement<EventToListener> {
    private _content: Node;

    get elementCount(): number {
        return this._content.children.length;
    }

    private _transformDirty = true;

    private _explicit_size?: Vec2;
    private _implicit_size = vec2.create();
    public override get size(): Readonly<Vec2> {
        if (this._explicit_size) {
            return this._explicit_size;
        }

        rect.set(rect_a, 0, 0, 0, 0);
        for (let i = 0; i < this.elementCount; i++) {
            const element = this.getElement(i);
            rect.union(rect_a, rect_a, element.getBoundsToParent());
        }
        return vec2.set(this._implicit_size, rect_a.width, rect_a.height);
    }
    public override set size(value: Readonly<Vec2>) {
        this._explicit_size = vec2.set(this._explicit_size || vec2.create(), value[0], value[1]);
        this._transformDirty = true;
    }

    private _anchor: Readonly<Vec2> = vec2.create(0.5, 0.5);
    public get anchor() {
        return this._anchor;
    }
    public set anchor(value: Readonly<Vec2>) {
        this._anchor = value;
        this._transformDirty = true;
    }

    override getBounds(): Rect {
        return rect.create(-this.size[0] * this._anchor[0], -this.size[1] * this._anchor[1], this.size[0], this.size[1]);
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
        this._content.addChild(element.node);
    }

    override update(): void {
        if (this._transformDirty) {
            rect.set(rect_a, 0, 0, 0, 0);
            for (let i = 0; i < this.elementCount; i++) {
                const element = this.getElement(i);
                rect.union(rect_a, rect_a, element.getBoundsToParent());
            }
            console.log('rect_a', rect_a)

            this._content.position = vec3.create(-this.size[0] * this.anchor[0] - rect_a.x, -this.size[1] * this.anchor[1] - rect_a.y, 0);

            this._transformDirty = false;
        }
    }
}