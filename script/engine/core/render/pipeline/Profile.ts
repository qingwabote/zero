import { EventEmitter } from "bastard";

enum Event {
    CULL_START = 'CULL_START',
    CULL_END = 'CULL_END'
}

interface Event2Listener {
    [Event.CULL_START]: () => void;
    [Event.CULL_END]: () => void;
}

interface ProfileReadonly extends EventEmitter.Readonly<Event2Listener> {
    readonly passes: number;
    readonly draws: number;
    readonly stages: number;
}

export class Profile extends EventEmitter.Impl<Event2Listener> implements ProfileReadonly {
    static readonly Event = Event;

    passes: number = 0;

    draws: number = 0;

    stages: number = 0;

    clear() {
        this.passes = 0;
        this.draws = 0;
        this.stages = 0;
    }
}

export declare namespace Profile {
    export { ProfileReadonly as Readonly }
}