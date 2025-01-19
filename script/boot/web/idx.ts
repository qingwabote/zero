// load console first
import { log } from "./console.js";
//
import { Device } from "gfx";

const pixelRatio: number = devicePixelRatio;
const pixelWidth: number = document.documentElement.clientWidth * pixelRatio;
const pixelHeight: number = document.documentElement.clientHeight * pixelRatio;

const canvas = document.getElementById('boot_canvas') as HTMLCanvasElement;
canvas.width = pixelWidth;
canvas.height = pixelHeight;
canvas.style.width = `${document.documentElement.clientWidth}px`;
canvas.style.height = `${document.documentElement.clientHeight}px`;

export const safeArea = (function () {
    const top = document.getElementById("boot_log")!.clientHeight * pixelRatio;
    return { left: 0, right: 0, top, bottom: 0, width: pixelWidth, height: pixelHeight - top };
})();

export const platform = 'web';

export interface TouchEvent {
    get count(): number;
    x(index: number): number;
    y(index: number): number;
}

export interface WheelEvent extends TouchEvent {
    get delta(): number;
}

const canvasBoundingClientRect = canvas.getBoundingClientRect();

class TouchEventImpl implements TouchEvent {
    get count(): number {
        return this._event.touches.length;
    }

    constructor(private _event: globalThis.TouchEvent) { }

    x(index: number): number {
        return (this._event.touches[index].clientX - canvasBoundingClientRect.x) * pixelRatio;
    }

    y(index: number): number {
        return (this._event.touches[index].clientY - canvasBoundingClientRect.y) * pixelRatio;
    }
}

class MouseEventImpl implements TouchEvent {
    get count(): number {
        return 1;
    }

    constructor(protected _event: globalThis.MouseEvent) { }

    x(index: number): number {
        return this._event.offsetX * pixelRatio;
    }

    y(index: number): number {
        return this._event.offsetY * pixelRatio;
    }
}

class WheelEventImpl extends MouseEventImpl implements WheelEvent {
    get delta(): number {
        return -(this._event as globalThis.WheelEvent).deltaY;
    }
}

export interface EventListener {
    onTouchStart(event: TouchEvent): void;
    onTouchMove(event: TouchEvent): void;
    onTouchEnd(event: TouchEvent): void;
    onWheel(event: WheelEvent): void;
    onFrame(): void;
}

export const device = new Device(canvas.getContext('webgl2', { antialias: false })!);

export const initial = performance.now();

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
export function textEncode(source: string, destination: Uint8Array) {
    return textEncoder.encodeInto(source, destination).written;
}
export function textDecode(input: Uint8Array): string {
    return textDecoder.decode(input);
}

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
    canvas.addEventListener('touchstart', function (touchEvent) {
        listener.onTouchStart(new TouchEventImpl(touchEvent));
        touchEvent.preventDefault(); // prevent mousedown
    })
    canvas.addEventListener('touchmove', function (touchEvent) {
        listener.onTouchMove(new TouchEventImpl(touchEvent));
    })
    canvas.addEventListener('touchend', function (touchEvent) {
        listener.onTouchEnd(new TouchEventImpl(touchEvent));
    })
    canvas.addEventListener('touchcancel', function (touchEvent) {
        listener.onTouchEnd(new TouchEventImpl(touchEvent));
    })

    canvas.addEventListener("mousedown", function (mouseEvent) {
        listener.onTouchStart(new MouseEventImpl(mouseEvent));
    })
    canvas.addEventListener("mouseup", function (mouseEvent) {
        listener.onTouchEnd(new MouseEventImpl(mouseEvent))
    })
    canvas.addEventListener("mousemove", function (mouseEvent) {
        if (mouseEvent.buttons) {
            listener.onTouchMove(new MouseEventImpl(mouseEvent))
        }
    })

    canvas.addEventListener("wheel", function (wheelEvent) {
        listener.onWheel(new WheelEventImpl(wheelEvent));
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
