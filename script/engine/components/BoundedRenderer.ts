import { EventEmitter } from "bastard";
import { AABB3D } from "../core/math/aabb3d.js";
import { ModelRenderer } from "./internal/ModelRenderer.js";

enum EventName {
    BOUNDS_CHANGED = "BOUNDS_CHANGED"
}

interface BoundsEventToListener {
    [EventName.BOUNDS_CHANGED]: () => void;
}

const emitter: EventEmitter<BoundsEventToListener> = new EventEmitter.Impl;
emitter.on(EventName.BOUNDS_CHANGED, () => { })

/**
 * Provides a bounds for ui system
 */
export abstract class BoundedRenderer extends ModelRenderer implements EventEmitter<BoundsEventToListener> {
    static readonly PIXELS_PER_UNIT: number = 100;

    private __emitter?: EventEmitter<BoundsEventToListener> = undefined;
    private get _emitter(): EventEmitter<BoundsEventToListener> {
        return this.__emitter ?? (this.__emitter = new EventEmitter.Impl);
    }
    has<K extends keyof BoundsEventToListener>(name: K): boolean {
        return this.__emitter ? this.__emitter.has(name) : false;
    }
    on<K extends keyof BoundsEventToListener>(name: K, listener: BoundsEventToListener[K]) {
        return this._emitter.on(name, listener);
    }
    off<K extends keyof BoundsEventToListener>(name: K, listener: BoundsEventToListener[K]): void {
        this._emitter.off(name, listener);
    }
    emit<K extends keyof BoundsEventToListener>(name: K, ...args: Parameters<BoundsEventToListener[K]>): void {
        this.__emitter?.emit(name, ...args);
    }

    public abstract get bounds(): Readonly<AABB3D>;

    order(value: number): void {
        if (this._model) {
            this._model.order = value;
        }
    }
}
BoundedRenderer.EventName = EventName;

export declare namespace BoundedRenderer {
    export { EventName }
}