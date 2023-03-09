import EventEmitter from "../../../base/EventEmitter.js";
import EventEmitterImpl from "../../../base/EventEmitterImpl.js";
import Component from "../../../core/Component.js";
import rect, { Rect } from "../../../core/math/rect.js";
import vec2, { Vec2 } from "../../../core/math/vec2.js";

export class UITouch {
    world = vec2.create();
    local = vec2.create();
    constructor(world: Vec2, local: Vec2) {
        vec2.set(this.world, ...world)
        vec2.set(this.local, ...local)
    }
}

export enum UITouchEventType {
    TOUCH_START = "TOUCH_START",
    TOUCH_MOVE = "TOUCH_MOVE",
    TOUCH_END = "TOUCH_END",
}

export class UITouchEvent {
    constructor(readonly touch: UITouch) { }
}

interface EventToListener {
    [UITouchEventType.TOUCH_START]: (event: UITouchEvent) => void;
    [UITouchEventType.TOUCH_MOVE]: (event: UITouchEvent) => void;
    [UITouchEventType.TOUCH_END]: (event: UITouchEvent) => void;
}

export default class UIElement extends Component implements EventEmitter<EventToListener> {
    private __emitter?: EventEmitter<EventToListener>;
    private get _emitter() {
        return this.__emitter ? this.__emitter : this.__emitter = new EventEmitterImpl;
    }
    has<K extends UITouchEventType>(name: K): boolean {
        return this.__emitter ? this.__emitter.has(name) : false;
    }
    on<K extends UITouchEventType>(name: K, listener: EventToListener[K] extends (event: any) => void ? EventToListener[K] : (event: any) => void): void {
        this._emitter.on(name, listener);
    }
    off<K extends UITouchEventType>(name: K, listener: EventToListener[K] extends (event: any) => void ? EventToListener[K] : (event: any) => void): void {
        this._emitter.off(name, listener);
    }
    emit<K extends UITouchEventType>(name: K, event?: Parameters<EventToListener[K] extends (event: any) => void ? EventToListener[K] : (event: any) => void>[0] | undefined): void {
        this.__emitter?.emit(name, event);
    }


    private _size = vec2.create();
    public get size() {
        return this._size;
    }
    public set size(value) {
        this._size = value;
    }

    getBounds(): Rect {
        return rect.create(-this.size[0] / 2, -this.size[1] / 2, this.size[0], this.size[1]);
    }
}