import { EventEmitter } from "bastard";

enum Event {
    CULL_START = 'CULL_START',
    CULL_END = 'CULL_END',

    BATCH_UPLOAD_START = 'BATCH_UPLOAD_START',
    BATCH_UPLOAD_END = 'BATCH_UPLOAD_END'
}

interface Event2Listener {
    [Event.CULL_START]: () => void;
    [Event.CULL_END]: () => void;

    [Event.BATCH_UPLOAD_START]: () => void;
    [Event.BATCH_UPLOAD_END]: () => void;
}

interface ProfileReadonly extends EventEmitter.Readonly<Event2Listener> {
    readonly materials: number;
    readonly pipelines: number;
    readonly draws: number;
    readonly stages: number;
}

export class Profile extends EventEmitter.Impl<Event2Listener> implements ProfileReadonly {
    static readonly Event = Event;

    materials: number = 0;

    pipelines: number = 0;

    draws: number = 0;

    stages: number = 0;

    clear() {
        this.materials = 0;
        this.pipelines = 0;
        this.draws = 0;
        this.stages = 0;
    }
}

export declare namespace Profile {
    export { ProfileReadonly as Readonly }
}