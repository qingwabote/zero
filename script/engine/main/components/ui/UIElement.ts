import { EventEmitter } from "../../base/EventEmitter.js";
import { EventEmitterImpl } from "../../base/EventEmitterImpl.js";
import { Component } from "../../core/Component.js";
import { aabb2d, AABB2D } from "../../core/math/aabb2d.js";
import { vec2, Vec2 } from "../../core/math/vec2.js";

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

export enum UIBoundsEventType {
    BOUNDS_CHANGED = "BOUNDS_CHANGED",
}

export interface UIEventToListener {
    [UITouchEventType.TOUCH_START]: (event: UITouchEvent) => void;
    [UITouchEventType.TOUCH_MOVE]: (event: UITouchEvent) => void;
    [UITouchEventType.TOUCH_END]: (event: UITouchEvent) => void;
    [UIBoundsEventType.BOUNDS_CHANGED]: () => void;
}

export abstract class UIElement<EventToListener extends UIEventToListener = UIEventToListener> extends Component implements EventEmitter<EventToListener> {
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

    public abstract get anchor(): Readonly<Vec2>;
    public abstract set anchor(value: Readonly<Vec2>);

    private _bounds = aabb2d.create();
    getBounds(): AABB2D {
        const size = this.size;
        const anchor = this.anchor;
        vec2.set(vec2_a, -size[0] * anchor[0], -size[1] * anchor[1]);
        vec2.add(vec2_b, vec2_a, size);
        return aabb2d.fromPoints(this._bounds, vec2_a, vec2_b);
    }

    private _boundsToParent = aabb2d.create();
    getBoundsToParent(): AABB2D {
        const bounds = this.getBounds();
        aabb2d.toPoints(vec2_a, vec2_b, bounds);
        vec2.transformMat4(vec2_a, vec2_a, this.node.matrix);
        vec2.transformMat4(vec2_b, vec2_b, this.node.matrix);
        vec2.min(vec2_c, vec2_a, vec2_b);
        vec2.max(vec2_d, vec2_a, vec2_b);
        return aabb2d.fromPoints(this._boundsToParent, vec2_c, vec2_d);
    }

    getBoundsOnTouch() {
        return this.getBounds();
    }
}