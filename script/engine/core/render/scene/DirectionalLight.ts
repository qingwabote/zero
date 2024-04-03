import { EventEmitter, EventEmitterImpl } from "bastard";
import { Zero } from "../../Zero.js";
import { DirectionalLightShadow } from "./DirectionalLightShadow.js";
import { FrameChangeRecord } from "./FrameChangeRecord.js";
import { Transform } from "./Transform.js";

enum Event {
    UPDATE = 'UPDATE'
}

interface EventToListener {
    [Event.UPDATE]: () => void;
}

export class DirectionalLight extends FrameChangeRecord {
    static readonly Event = Event;

    private _emitter?: EventEmitter<EventToListener> = undefined;
    public get emitter() {
        return this._emitter ?? (this._emitter = new EventEmitterImpl);
    }

    private _shadows: Record<number, DirectionalLightShadow> = {};
    public get shadows(): Readonly<Record<number, DirectionalLightShadow>> {
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
            const shadow = this._shadows[value[i]] || (this._shadows[value[i]] = new DirectionalLightShadow(this, camera));
            shadow.index = i;
        }
        this._shadow_cameras = value;
    }

    constructor(public transform: Transform) {
        super();
        Zero.instance.scene.directionalLight = this;
    }

    update() {
        for (let i = 0; i < this._shadow_cameras.length; i++) {
            this._shadows[this._shadow_cameras[i]].update();
        }
        this._emitter?.emit(Event.UPDATE);
    }
}