import { EventEmitter, EventEmitterImpl } from "bastard";
import { AABB3D } from "../core/math/aabb3d.js";
import { ModelRenderer } from "./internal/ModelRenderer.js";

export enum BoundsEventName {
    BOUNDS_CHANGED = "BOUNDS_CHANGED",
}

interface BoundsEventToListener {
    [BoundsEventName.BOUNDS_CHANGED]: () => void;
}

/**
 * Provides a bounds for ui system
 */
export abstract class BoundedRenderer extends ModelRenderer implements EventEmitter<BoundsEventToListener> {
    static readonly PIXELS_PER_UNIT: number = 100;

    private __emitter?: EventEmitter<BoundsEventToListener> = undefined;
    private get _emitter() {
        return this.__emitter ?? (this.__emitter = new EventEmitterImpl);
    }
    has<K extends keyof BoundsEventToListener>(name: K): boolean {
        return this.__emitter ? this.__emitter.has(name) : false;
    }
    on<K extends keyof BoundsEventToListener>(name: K, listener: BoundsEventToListener[K]): void {
        this._emitter.on(name, listener);
    }
    off<K extends keyof BoundsEventToListener>(name: K, listener: BoundsEventToListener[K]): void {
        this._emitter.off(name, listener);
    }
    emit<K extends keyof BoundsEventToListener>(name: K, ...args: Parameters<BoundsEventToListener[K]>): void {
        this.__emitter?.emit(name, ...args);
    }

    public abstract get bounds(): Readonly<AABB3D>;
}