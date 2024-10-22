import { Input, SpriteFrame, SpriteRenderer, Texture, bundle, vec4 } from "engine";
import { ElementContainer } from "./ElementContainer.js";
import { Renderer } from "./Renderer.js";
import * as yoga from "./yoga/index.js";
const splash_texture = await bundle.cache('images/splash.png', Texture);
const splash_frame = new SpriteFrame(splash_texture.impl);
var EventType;
(function (EventType) {
    EventType["CHANGED"] = "CHANGED";
})(EventType || (EventType = {}));
export class Slider extends ElementContainer {
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = Math.max(Math.min(value, 1), 0);
        this.onValue();
    }
    constructor(node) {
        super(node);
        this._value = 0.5;
        const background = Renderer.create(SpriteRenderer);
        background.impl.spriteFrame = splash_frame;
        background.setWidth('100%');
        background.setHeight('100%');
        this.addElement(background);
        const foreground = Renderer.create(SpriteRenderer);
        foreground.impl.spriteFrame = splash_frame;
        foreground.impl.color = vec4.create(0, 1, 0, 1);
        foreground.setHeight('100%');
        foreground.positionType = yoga.PositionType.Absolute;
        foreground.setPosition(yoga.Edge.Top, 0);
        this.addElement(foreground);
        this._foreground = foreground;
        this.emitter.on(Input.TouchEvents.START, (event) => {
            this.onTouch(event.touch.local);
        });
        this.emitter.on(Input.TouchEvents.MOVE, (event) => {
            this.onTouch(event.touch.local);
        });
        this.onValue();
    }
    onValue() {
        this._foreground.setWidth(`${this._value * 100}%`);
    }
    onTouch(pos) {
        this.value = pos[0] / (this.bounds.halfExtent[0] * 2);
        this.emitter.emit(EventType.CHANGED);
    }
}
Slider.EventType = EventType;
