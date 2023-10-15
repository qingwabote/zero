// load implementations first
import "./impl/index.js";
//
import { Device } from "gfx";

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
    onFrame(): void;
}

const canvas = document.getElementById("ZeroCanvas") as HTMLCanvasElement;

export const device = new Device(canvas.getContext('webgl2', { alpha: false, antialias: false })!);

export function now() {
    return performance.now();
}

export function listen(listener: EventListener) {
    const canvas = document.getElementById("ZeroCanvas") as HTMLCanvasElement;

    canvas.addEventListener("mousedown", function (mouseEvent) {
        listener.onTouchStart({ touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] });
    })
    canvas.addEventListener("mousemove", function (mouseEvent) {
        if (mouseEvent.buttons) {
            listener.onTouchMove({ touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] })
        }
    })
    canvas.addEventListener("mouseup", function (mouseEvent) {
        listener.onTouchEnd({ touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] })
    })

    canvas.addEventListener("wheel", function (wheelEvent) {
        listener.onGesturePinch({ delta: wheelEvent.deltaY });
    })

    function loop() {
        listener.onFrame();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}
