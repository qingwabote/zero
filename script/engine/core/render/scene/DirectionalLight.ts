import { EventEmitter, EventEmitterImpl } from "bastard";
import { Zero } from "../../Zero.js";
import { DirectionalLightFurstum } from "./DirectionalLightFurstum.js";
import { Transform } from "./Transform.js";

enum Event {
    UPDATE = 'UPDATE'
}

interface EventToListener {
    [Event.UPDATE]: () => void;
}

export class DirectionalLight {
    static readonly Event = Event;

    private _emitter?: EventEmitter<EventToListener> = undefined;
    public get emitter(): EventEmitter<EventToListener> {
        return this._emitter ?? (this._emitter = new EventEmitterImpl);
    }

    private _shadows: Record<number, DirectionalLightFurstum> = {};
    public get shadows(): Readonly<Record<number, DirectionalLightFurstum>> {
        return this._shadows;
    }

    private _shadow_cameras: readonly number[] = [];
    public get shadow_cameras(): readonly number[] {
        return this._shadow_cameras;
    }
    public set shadow_cameras(value: readonly number[]) {
        const cameras = Zero.instance.scene.cameras;
        for (let i = 0; i < value.length; i++) {
            const camera = cameras[value[i]];
            const shadow = this._shadows[value[i]] || (this._shadows[value[i]] = new DirectionalLightFurstum(this, camera.frustum));
            shadow.index = i;
        }
        this._shadow_cameras = value;
    }

    constructor(public transform: Transform) {
        Zero.instance.scene.directionalLight = this;
    }

    update() {
        for (let i = 0; i < this._shadow_cameras.length; i++) {
            this._shadows[this._shadow_cameras[i]].update();
        }
        this._emitter?.emit(Event.UPDATE);
    }
}