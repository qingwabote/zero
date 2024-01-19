import { EventEmitter, EventEmitterImpl } from "bastard";
import { AABB2D } from "../core/math/aabb2d.js";
import { ModelRenderer } from "./internal/ModelRenderer.js";

export enum BoundsEventName {
    BOUNDS_CHANGED = "BOUNDS_CHANGED",
}

interface BoundsEventToListener {
    [BoundsEventName.BOUNDS_CHANGED]: () => void;
}

export abstract class BoundedRenderer extends ModelRenderer implements EventEmitter<BoundsEventToListener> {
    static readonly PIXELS_PER_UNIT: number = 100;

    private __emitter?: EventEmitter<BoundsEventToListener> = undefined;
    private get _emitter() {
        return this.__emitter ? this.__emitter : this.__emitter = new EventEmitterImpl;
    }
    has<K extends BoundsEventName>(name: K): boolean {
        return this.__emitter ? this.__emitter.has(name) : false;
    }
    on<K extends BoundsEventName>(name: K, listener: BoundsEventToListener[K] extends (event: any) => void ? BoundsEventToListener[K] : (event: any) => void): void {
        this._emitter.on(name, listener);
    }
    off<K extends BoundsEventName>(name: K, listener: BoundsEventToListener[K] extends (event: any) => void ? BoundsEventToListener[K] : (event: any) => void): void {
        this._emitter.off(name, listener);
    }
    emit<K extends BoundsEventName>(name: K, event?: Parameters<BoundsEventToListener[K] extends (event: any) => void ? BoundsEventToListener[K] : (event: any) => void>[0] | undefined): void {
        this.__emitter?.emit(name, event);
    }

    public abstract get bounds(): Readonly<AABB2D>;
}