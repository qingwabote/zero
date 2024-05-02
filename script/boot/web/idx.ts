// load console first
import { log } from "./console.js";
//
import { Device } from "gfx";

const [styleWidth, styleHeight, pixelWidth, pixelHeight, pixelRatio] = (function () {
    const { clientWidth, clientHeight } = document.documentElement;
    return [clientWidth, clientHeight, clientWidth * devicePixelRatio, clientHeight * devicePixelRatio, devicePixelRatio];
})()

const canvas = document.getElementById('boot_canvas') as HTMLCanvasElement;
canvas.width = pixelWidth;
canvas.height = pixelHeight;
canvas.style.width = `${styleWidth}px`;
canvas.style.height = `${styleHeight}px`;

export const safeArea = (function () {
    const top = document.getElementById("boot_log")!.clientHeight * pixelRatio;
    return { left: 0, right: 0, top, bottom: 0, width: pixelWidth, height: pixelHeight - top };
})();

export const platform = 'web';

export interface Touch {
    readonly x: number,
    readonly y: number
}

export interface TouchEvent {
    readonly touches: readonly Touch[]
}

export interface GestureEvent extends TouchEvent {
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

export const device = new Device(canvas.getContext('webgl2', { antialias: false })!);

export const initial = performance.now();

export function now() { return performance.now(); }

export interface ResultTypes {
    text: string,
    buffer: ArrayBuffer,
    bitmap: ImageBitmap
}

export function load<T extends keyof ResultTypes>(url: string, type: T, onProgress?: (loaded: number, total: number, url: string) => void): Promise<ResultTypes[T]> {
    return new Promise((resolve, reject) => {
        function rej(reason: any) {
            log(reason);
            reject(reason);
        }
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
                rej(`download failed: ${url}, status: ${xhr.status}(no response)`)
            }
        };
        xhr.onprogress = (event) => {
            log(`download: ${url}, progress: ${event.loaded / event.total * 100}`)
            onProgress?.(event.loaded, event.total, url);
        }
        xhr.onerror = () => {
            rej(`download failed: ${url}, status: ${xhr.status}(error)`);
        };
        xhr.ontimeout = () => {
            rej(`download failed: ${url}, status: ${xhr.status}(time out)`);
        };
        xhr.onabort = () => {
            rej(`download failed: ${url}, status: ${xhr.status}(abort)`);
        };
        xhr.send(null);
    })
}

export async function loadWasm(url: string, imports: WebAssembly.Imports): Promise<WebAssembly.WebAssemblyInstantiatedSource> {
    return WebAssembly.instantiate(await load(url, 'buffer'), imports);
}

export function loadBundle(name: string): Promise<void> { throw new Error("unimplemented"); }

export function attach(listener: EventListener) {
    let lastTouch: Touch;

    canvas.addEventListener('touchstart', function (touchEvent) {
        const touch = touchEvent.touches[0];
        const rect = canvas.getBoundingClientRect();
        const offsetX = touch.clientX - rect.x;
        const offsetY = touch.clientY - rect.y;
        listener.onTouchStart({ touches: [lastTouch = { x: offsetX * pixelRatio, y: offsetY * pixelRatio }] });
        touchEvent.preventDefault(); // prevent mousedown
    })
    canvas.addEventListener('touchmove', function (touchEvent) {
        const touch = touchEvent.touches[0];
        const rect = canvas.getBoundingClientRect();
        const offsetX = touch.clientX - rect.x;
        const offsetY = touch.clientY - rect.y;
        listener.onTouchMove({ touches: [lastTouch = { x: offsetX * pixelRatio, y: offsetY * pixelRatio }] });
    })
    canvas.addEventListener('touchend', function (touchEvent) {
        listener.onTouchEnd({ touches: [lastTouch] });
    })
    canvas.addEventListener('touchcancel', function (touchEvent) {
        listener.onTouchEnd({ touches: [lastTouch] });
    })

    canvas.addEventListener("mousedown", function (mouseEvent) {
        listener.onTouchStart({ touches: [{ x: mouseEvent.offsetX * pixelRatio, y: mouseEvent.offsetY * pixelRatio }] });
    })
    canvas.addEventListener("mouseup", function (mouseEvent) {
        listener.onTouchEnd({ touches: [{ x: mouseEvent.offsetX * pixelRatio, y: mouseEvent.offsetY * pixelRatio }] })
    })
    canvas.addEventListener("mousemove", function (mouseEvent) {
        if (mouseEvent.buttons) {
            listener.onTouchMove({ touches: [{ x: mouseEvent.offsetX * pixelRatio, y: mouseEvent.offsetY * pixelRatio }] })
        }
    })

    canvas.addEventListener("wheel", function (wheelEvent) {
        listener.onGesturePinch({ touches: [{ x: wheelEvent.offsetX * pixelRatio, y: wheelEvent.offsetY * pixelRatio }], delta: wheelEvent.deltaY });
        wheelEvent.preventDefault();
    })

    function loop() {
        listener.onFrame();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

export function detach(listener: EventListener) { throw new Error("unimplemented"); }

export function reboot() { throw new Error("unimplemented"); }
