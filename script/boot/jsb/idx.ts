// load implementations first
import "./impl/index.js";

export interface Touch {
    readonly x: number,
    readonly y: number
}

export interface TouchEvent {
    readonly touches: readonly Touch[]
}

export interface GestureEvent {
    readonly delta: number
}

export interface EventListener {
    onTouchStart(event: TouchEvent): void;
    onTouchMove(event: TouchEvent): void;
    onTouchEnd(event: TouchEvent): void;
    onGesturePinch(event: GestureEvent): void;
    onGestureRotate(event: GestureEvent): void;
    onFrame(timestamp: number): void;
}

export function listen(listener: EventListener) {
    const zero = (globalThis as any).zero;

    zero.onTouchStart((event: any) => {
        const touch = event.touches.get(0);
        listener.onTouchStart({ touches: [touch] });
    })
    zero.onTouchMove((event: any) => {
        const touch = event.touches.get(0);
        listener.onTouchMove({ touches: [touch] })
    })
    zero.onTouchEnd((event: any) => {
        const touch = event.touches.get(0);
        listener.onTouchEnd({ touches: [touch] })
    })

    function loop(timestamp: number) {
        listener.onFrame(timestamp);
        zero.requestAnimationFrame(loop);
    }
    zero.requestAnimationFrame(loop);
}