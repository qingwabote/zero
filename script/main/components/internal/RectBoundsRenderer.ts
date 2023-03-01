import EventEmitter from "../../base/EventEmitter.js";
import EventEmitterImpl from "../../base/EventEmitterImpl.js";
import Component from "../../core/Component.js";
import rect, { Rect } from "../../core/math/rect.js";

export enum BoundsEvent {
    BOUNDS_CHANGED = "BOUNDS_CHANGED",
}

interface BoundsEventToListener {
    [BoundsEvent.BOUNDS_CHANGED]: () => void;
}

export default class RectBoundsRenderer extends Component implements EventEmitter<BoundsEventToListener> {
    static readonly PIXELS_PER_UNIT = 100;

    private __emitter?: EventEmitter<BoundsEventToListener>;
    private get _emitter() {
        if (!this.__emitter) {
            this.__emitter = new EventEmitterImpl;
        }
        return this.__emitter;
    }

    private _bounds = rect.create();
    public get bounds(): Readonly<Rect> {
        return this._bounds;
    }

    protected updateBounds(x: number, y: number, width: number, height: number) {
        rect.set(this._bounds, x, y, width, height);
        this.__emitter?.emit(BoundsEvent.BOUNDS_CHANGED);
    }

    on<K extends BoundsEvent>(name: K, listener: BoundsEventToListener[K] extends (event: any) => void ? BoundsEventToListener[K] : (event: any) => void): void {
        this._emitter.on(name, listener);
    }
    off<K extends BoundsEvent>(name: K, listener: BoundsEventToListener[K] extends (event: any) => void ? BoundsEventToListener[K] : (event: any) => void): void {
        this._emitter.off(name, listener);
    }
    emit<K extends BoundsEvent>(name: K, event?: Parameters<BoundsEventToListener[K] extends (event: any) => void ? BoundsEventToListener[K] : (event: any) => void>[0] | undefined): void {
        this._emitter.emit(name, event);
    }
}