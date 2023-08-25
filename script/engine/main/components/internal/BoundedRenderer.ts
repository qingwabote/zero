import { EventEmitter } from "../../base/EventEmitter.js";
import { EventEmitterImpl } from "../../base/EventEmitterImpl.js";
import { AABB2D } from "../../core/math/aabb2d.js";
import { ModelRenderer } from "./ModelRenderer.js";

export enum BoundsEvent {
    BOUNDS_CHANGED = "BOUNDS_CHANGED",
}

interface BoundsEventToListener {
    [BoundsEvent.BOUNDS_CHANGED]: () => void;
}

export abstract class BoundedRenderer extends ModelRenderer implements EventEmitter<BoundsEventToListener> {
    static readonly PIXELS_PER_UNIT: number = 100;

    private __emitter?: EventEmitter<BoundsEventToListener>;
    private get _emitter() {
        return this.__emitter ? this.__emitter : this.__emitter = new EventEmitterImpl;
    }
    has<K extends BoundsEvent>(name: K): boolean {
        return this.__emitter ? this.__emitter.has(name) : false;
    }
    on<K extends BoundsEvent>(name: K, listener: BoundsEventToListener[K] extends (event: any) => void ? BoundsEventToListener[K] : (event: any) => void): void {
        this._emitter.on(name, listener);
    }
    off<K extends BoundsEvent>(name: K, listener: BoundsEventToListener[K] extends (event: any) => void ? BoundsEventToListener[K] : (event: any) => void): void {
        this._emitter.off(name, listener);
    }
    emit<K extends BoundsEvent>(name: K, event?: Parameters<BoundsEventToListener[K] extends (event: any) => void ? BoundsEventToListener[K] : (event: any) => void>[0] | undefined): void {
        this.__emitter?.emit(name, event);
    }

    public abstract get bounds(): Readonly<AABB2D>;
}