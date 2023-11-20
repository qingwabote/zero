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

const canvas = document.getElementById('boot_canvas') as HTMLCanvasElement;

export const platform = 'web';

const { width, height } = canvas;

export const safeArea = { x: -width / 2, y: -height / 2, width, height };

export const device = new Device(canvas.getContext('webgl2', { alpha: false, antialias: false })!);

export const initial = performance.now();

export function now() {
    return performance.now();
}

const noop = function () { };

export interface ResultTypes {
    text: string,
    buffer: ArrayBuffer,
    bitmap: ImageBitmap
}

export function load<T extends keyof ResultTypes>(url: string, type: T, onProgress: (loaded: number, total: number, url: string) => void = noop): Promise<ResultTypes[T]> {
    url = "../" + url;// FIXME
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        switch (type) {
            case 'text':
                xhr.responseType = 'text'
                break;
            case 'buffer':
                xhr.responseType = 'arraybuffer'
                break;
            case 'bitmap':
                xhr.responseType = 'blob'
                break;
        }
        xhr.open('GET', url, true);
        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 0) {
                if (type == "bitmap") {
                    createImageBitmap(xhr.response, { premultiplyAlpha: 'none' }).then(resolve as (value: ImageBitmap) => void)
                } else {
                    resolve(xhr.response)
                }
            } else {
                reject(`download failed: ${url}, status: ${xhr.status}(no response)`)
            }
        };
        xhr.onprogress = (event) => {
            onProgress(event.loaded, event.total, url);
        }
        xhr.onerror = () => {
            reject(`download failed: ${url}, status: ${xhr.status}(error)`);
        };
        xhr.ontimeout = () => {
            reject(`download failed: ${url}, status: ${xhr.status}(time out)`);
        };
        xhr.onabort = () => {
            reject(`download failed: ${url}, status: ${xhr.status}(abort)`);
        };
        xhr.send(null);
    })
}

export function loadBundle(name: string): Promise<void> { throw new Error("unimplemented"); }

export function attach(listener: EventListener) {
    let lastTouch: Touch;

    canvas.addEventListener('touchstart', function (touchEvent) {
        const touch = touchEvent.touches[0];
        const rect = canvas.getBoundingClientRect();
        const offsetX = touch.clientX - rect.x;
        const offsetY = touch.clientY - rect.y;
        listener.onTouchStart({ touches: [lastTouch = { x: offsetX, y: offsetY }] });
        touchEvent.preventDefault(); // prevent mousedown
    })
    canvas.addEventListener('touchmove', function (touchEvent) {
        const touch = touchEvent.touches[0];
        const rect = canvas.getBoundingClientRect();
        const offsetX = touch.clientX - rect.x;
        const offsetY = touch.clientY - rect.y;
        listener.onTouchMove({ touches: [lastTouch = { x: offsetX, y: offsetY }] });
    })
    canvas.addEventListener('touchend', function (touchEvent) {
        listener.onTouchEnd({ touches: [lastTouch] });
    })
    canvas.addEventListener('touchcancel', function (touchEvent) {
        listener.onTouchEnd({ touches: [lastTouch] });
    })

    canvas.addEventListener("mousedown", function (mouseEvent) {
        listener.onTouchStart({ touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] });
    })
    canvas.addEventListener("mouseup", function (mouseEvent) {
        listener.onTouchEnd({ touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] })
    })
    canvas.addEventListener("mousemove", function (mouseEvent) {
        if (mouseEvent.buttons) {
            listener.onTouchMove({ touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] })
        }
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

export function detach(listener: EventListener) { throw new Error("unimplemented"); }

export function reboot() { throw new Error("unimplemented"); }
