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
    const canvas = document.getElementById("ZeroCanvas") as HTMLCanvasElement;

    canvas.addEventListener("mousedown", (mouseEvent) => {
        listener.onTouchStart({ touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] });
    })
    canvas.addEventListener("mousemove", (mouseEvent) => {
        if (mouseEvent.buttons) {
            listener.onTouchMove({ touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] })
        }
    })
    canvas.addEventListener("mouseup", (mouseEvent) => {
        listener.onTouchEnd({ touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] })
    })

    canvas.addEventListener("wheel", (wheelEvent) => {
        listener.onGesturePinch({ delta: wheelEvent.deltaY });
    })

    function loop(timestamp: number) {
        listener.onFrame(timestamp);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}
