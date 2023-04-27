import SpriteFrame from "../../assets/SpriteFrame.js";
import AssetLib from "../../core/AssetLib.js";
import Node from "../../core/Node.js";
import aabb2d, { AABB2D } from "../../core/math/aabb2d.js";
import vec2, { Vec2 } from "../../core/math/vec2.js";
import vec3 from "../../core/math/vec3.js";
import vec4 from "../../core/math/vec4.js";
import SpriteRenderer from "../SpriteRenderer.js";
import UIContainer from "./UIContainer.js";
import UIRenderer from "./UIRenderer.js";
import { UIEventToListener, UITouchEventType } from "./internal/UIElement.js";

const texture_splash_info = { path: '../../assets/images/splash.png', type: SpriteFrame };
AssetLib.preloaded.push(texture_splash_info);

export enum SliderEventType {
    CHANGED = 'CHANGED'
}

export interface SliderEventToListener extends UIEventToListener {
    [SliderEventType.CHANGED]: () => void
}

export default class Slider extends UIContainer<SliderEventToListener> {
    private _background: UIRenderer<SpriteRenderer>;
    private _foreground: UIRenderer<SpriteRenderer>;

    private _size = vec2.create(100, 10);
    public override get size(): Readonly<Vec2> {
        return this._size;
    }
    public override set size(value: Readonly<Vec2>) {
        vec2.copy(this._size, value);
        this.onSize();
    }

    private _value: number = 0.5;
    public get value(): number {
        return this._value;
    }
    public set value(value: number) {
        this._value = Math.max(Math.min(value, 1), 0);
        this.onValue();
    }

    constructor(node: Node) {
        super(node);

        const background = UIRenderer.create(SpriteRenderer);
        background.size = this._size;
        background.impl.spriteFrame = AssetLib.instance.get(texture_splash_info);
        this.addElement(background);
        this._background = background;

        const foreground = UIRenderer.create(SpriteRenderer);
        foreground.size = this._size;
        foreground.anchor = vec2.create(0, 0.5)
        foreground.impl.spriteFrame = AssetLib.instance.get(texture_splash_info);
        foreground.impl.color = vec4.create(0, 1, 0, 1);
        this.addElement(foreground);
        this._foreground = foreground;

        this.on(UITouchEventType.TOUCH_START, (event) => {
            this.onTouch(event.touch.local)
        })
        this.on(UITouchEventType.TOUCH_MOVE, (event) => {
            this.onTouch(event.touch.local)
        })

        this.onSize();
        this.onValue();
    }

    private _boundsOnTouch = aabb2d.create();
    override getBoundsOnTouch(): AABB2D {
        aabb2d.copy(this._boundsOnTouch, super.getBounds());
        vec2.scale(this._boundsOnTouch.halfExtent, this._boundsOnTouch.halfExtent, 1.1);
        return this._boundsOnTouch;
    }

    private onSize() {
        this._foreground.size = this._size;
        this._foreground.node.position = vec3.create(-this._size[0] / 2, 0, 0)
        this._background.size = this._size;
    }

    private onValue() {
        this._foreground.node.scale = vec3.create(this._value, 1, 1);
    }

    private onTouch(pos: Readonly<Vec2>) {
        const x = pos[0] + this._size[0] / 2
        this.value = x / this._size[0];
        this.emit(SliderEventType.CHANGED);
    }
}