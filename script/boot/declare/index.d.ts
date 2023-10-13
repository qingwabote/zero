export declare interface Touch {
    readonly x: number,
    readonly y: number
}

export declare interface TouchEvent {
    readonly touches: readonly Touch[]
}

export declare interface GestureEvent {
    readonly delta: number
}

export declare interface EventListener {
    onTouchStart(event: TouchEvent): void;
    onTouchMove(event: TouchEvent): void;
    onTouchEnd(event: TouchEvent): void;
    onGesturePinch(event: GestureEvent): void;
    onGestureRotate(event: GestureEvent): void;
    onFrame(timestamp: number): void;
}

export declare function listen(listener: EventListener);

