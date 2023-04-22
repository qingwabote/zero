import EventEmitter from "../../../base/EventEmitter.js";
import EventEmitterImpl from "../../../base/EventEmitterImpl.js";
import Component from "../../../core/Component.js";
import rect, { Rect } from "../../../core/math/rect.js";
import vec2, { Vec2 } from "../../../core/math/vec2.js";

const vec2_a = vec2.create();
const vec2_b = vec2.create();
const vec2_c = vec2.create();
const vec2_d = vec2.create();

type Listener = (event: any) => void;

export interface UITouch {
    world: Readonly<Vec2>;
    local: Readonly<Vec2>;
}

export enum UITouchEventType {
    TOUCH_START = "TOUCH_START",
    TOUCH_MOVE = "TOUCH_MOVE",
    TOUCH_END = "TOUCH_END",
}

export interface UITouchEvent {
    readonly touch: UITouch
}

export interface UIEventToListener {
    [UITouchEventType.TOUCH_START]: (event: UITouchEvent) => void;
    [UITouchEventType.TOUCH_MOVE]: (event: UITouchEvent) => void;
    [UITouchEventType.TOUCH_END]: (event: UITouchEvent) => void;
}

export default abstract class UIElement<EventToListener extends UIEventToListener = UIEventToListener> extends Component implements EventEmitter<EventToListener> {
    private __emitter?: EventEmitter<EventToListener>;
    private get _emitter() {
        return this.__emitter ? this.__emitter : this.__emitter = new EventEmitterImpl;
    }
    has<K extends keyof EventToListener & string>(name: K): boolean {
        return this.__emitter ? this.__emitter.has(name) : false;
    }
    on<K extends keyof EventToListener & string>(name: K, listener: EventToListener[K] extends Listener ? EventToListener[K] : Listener): void {
        this._emitter.on(name, listener);
    }
    off<K extends keyof EventToListener & string>(name: K, listener: EventToListener[K] extends Listener ? EventToListener[K] : Listener): void {
        this._emitter.off(name, listener);
    }
    emit<K extends keyof EventToListener & string>(name: K, event?: Parameters<EventToListener[K] extends Listener ? EventToListener[K] : Listener>[0]): void {
        this.__emitter?.emit(name, event);
    }

    public abstract get size(): Readonly<Vec2>;
    public abstract set size(value: Readonly<Vec2>);

    getBounds(): Rect {
        return rect.create(-this.size[0] / 2, -this.size[1] / 2, this.size[0], this.size[1]);
    }

    getBoundsToParent(): Rect {
        const bounds = this.getBounds();
        const l = bounds.x;
        const b = bounds.y;
        const r = l + bounds.width;
        const t = b + bounds.height;
        vec2.transformMat4(vec2_a, vec2.set(vec2_a, l, b), this.node.matrix);
        vec2.transformMat4(vec2_b, vec2.set(vec2_b, r, t), this.node.matrix);
        vec2.min(vec2_c, vec2_a, vec2_b);
        vec2.max(vec2_d, vec2_a, vec2_b);
        return rect.set(bounds, vec2_c[0], vec2_c[1], vec2_d[0] - vec2_c[0], vec2_d[1] - vec2_c[1]);
    }
}