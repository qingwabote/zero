import { Input, Node, SpriteFrame, SpriteRenderer, Texture, Vec2, bundle, vec4 } from "engine";
import { Element } from "./Element.js";
import { ElementContainer } from "./ElementContainer.js";
import { Renderer } from "./Renderer.js";
import { Edge, PositionType } from "./enums.js";

const splash_texture = await bundle.cache('images/splash.png', Texture);
const splash_frame = new SpriteFrame(splash_texture.impl);

enum EventType {
    CHANGED = 'CHANGED'
}

interface EventToListener extends Element.EventToListener {
    [EventType.CHANGED]: () => void
}

export class Slider extends ElementContainer<EventToListener> {
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
        background.setWidthPercent(100)
        background.setHeightPercent(100)
        this.addElement(background);

        const foreground = Renderer.create(SpriteRenderer);
        foreground.impl.spriteFrame = splash_frame;
        foreground.impl.color = vec4.create(0, 1, 0, 1);
        foreground.setHeightPercent(100)
        foreground.positionType = PositionType.Absolute
        foreground.setPosition(Edge.Top, 0)
        foreground.setPosition(Edge.Left, 0)
        this.addElement(foreground);
        this._foreground = foreground;

        this.emitter.on(Input.TouchEvents.START, (event) => {
            this.onTouch(event.touch.local)
        })
        this.emitter.on(Input.TouchEvents.MOVE, (event) => {
            this.onTouch(event.touch.local)
        })

        this.onValue();
    }

    private onValue() {
        this._foreground.setWidthPercent(this._value * 100)
    }

    private onTouch(pos: Readonly<Vec2>) {
        this.value = pos[0] / (this.bounds.halfExtent[0] * 2)
        this.emitter.emit(EventType.CHANGED);
    }
}
Slider.EventType = EventType;

export declare namespace Slider {
    export { EventType }
}