import { EventEmitterImpl, EventReceiver } from "bastard";

enum Event {
    CULL_START = 'CULL_START',
    CULL_END = 'CULL_END'
}

interface Event2Listener {
    [Event.CULL_START]: () => void;
    [Event.CULL_END]: () => void;
}

export interface ProfileReadonly extends EventReceiver<Event2Listener> {
    get draws(): number;
    get stages(): number;
}

export class Profile extends EventEmitterImpl<Event2Listener> implements ProfileReadonly {
    static readonly Event = Event;

    private _draws: number = 0;
    public get draws(): number {
        return this._draws;
    }
    public set draws(value: number) {
        this._draws = value;
    }

    private _stages: number = 0;
    public get stages(): number {
        return this._stages;
    }
    public set stages(value: number) {
        this._stages = value;
    }

    clear() {
        this._draws = 0;
        this._stages = 0;
    }
}