import { bundle } from "bundling";
import { InputEventType, Node, SpriteFrame, SpriteRenderer, Texture, Vec2, vec4 } from "engine";
import { EventToListener } from "./Element.js";
import { ElementContainer } from "./ElementContainer.js";
import { Renderer } from "./Renderer.js";
import * as yoga from "./yoga/index.js";

const splash_texture = await bundle.cache('images/splash.png', Texture);
const splash_frame = new SpriteFrame(splash_texture.impl);

export enum SliderEventType {
    CHANGED = 'CHANGED'
}

export interface SliderEventToListener extends EventToListener {
    [SliderEventType.CHANGED]: () => void
}

export class Slider extends ElementContainer<SliderEventToListener> {
    private _background: Renderer<SpriteRenderer>;
    private _foreground: Renderer<SpriteRenderer>;

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

        const background = Renderer.create(SpriteRenderer);
        background.impl.spriteFrame = splash_frame;
        background.setWidth('100%')
        background.setHeight('100%')
        this.addElement(background);
        this._background = background;

        const foreground = Renderer.create(SpriteRenderer);
        foreground.impl.spriteFrame = splash_frame;
        foreground.impl.color = vec4.create(0, 1, 0, 1);
        foreground.setHeight('100%')
        foreground.positionType = yoga.PositionType.Absolute
        foreground.setPosition(yoga.Edge.Top, 0)
        this.addElement(foreground);
        this._foreground = foreground;

        this.emitter.on(InputEventType.TOUCH_START, (event) => {
            this.onTouch(event.touch.local)
        })
        this.emitter.on(InputEventType.TOUCH_MOVE, (event) => {
            this.onTouch(event.touch.local)
        })

        this.onValue();
    }

    private onValue() {
        this._foreground.setWidth(`${this._value * 100}%`)
    }

    private onTouch(pos: Readonly<Vec2>) {
        this.value = pos[0] / (this.bounds.halfExtent[0] * 2)
        this.emitter.emit(SliderEventType.CHANGED);
    }
}