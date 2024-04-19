import { EventEmitterImpl } from "bastard";
import { Shadow } from "./Shadow.js";

enum Event {
    UPDATE = 'UPDATE'
}

interface EventToListener {
    [Event.UPDATE]: () => void;
}

export class Data extends EventEmitterImpl<EventToListener> {
    static readonly Event = Event;

    readonly shadow = new Shadow;

    flowLoopIndex = 0;

    update(dumping: boolean) {
        this.shadow.update(dumping);
        this.emit(Event.UPDATE);
    }
}