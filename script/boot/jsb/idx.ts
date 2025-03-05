import { ResultTypes } from "boot";
import { Device } from "gfx";

export interface TouchEvent {
    get count(): number;
    x(index: number): number;
    y(index: number): number;
}

export interface WheelEvent extends TouchEvent {
    get delta(): number;
}

class TouchEventImpl implements TouchEvent {
    get count(): number {
        return this._event.touches.size();
    }

    constructor(protected _event: any) { }

    x(index: number): number {
        return this._event.touches.get(index).x
    }

    y(index: number): number {
        return this._event.touches.get(index).y
    }
}

class WheelEventImpl extends TouchEventImpl implements WheelEvent {
    get delta(): number {
        return this._event.delta;
    }
}

export interface EventListener {
    onTouchStart(event: TouchEvent): void;
    onTouchMove(event: TouchEvent): void;
    onTouchEnd(event: TouchEvent): void;
    onWheel(event: WheelEvent): void;
    onFrame(): void;
}

export const platform = 'jsb';

declare const zero: any;

const w = zero.Window.instance();

export const device: Device = w.device();

const { width, height } = device.swapchain.color.info;

export const safeArea = { left: 0, right: 0, top: 0, bottom: 0, width, height: height };

export const initial: number = w.now();

export function textEncode(source: string, destination: Uint8Array) {
    return zero.textEncode(source, destination);
}
export function textDecode(input: Uint8Array): string {
    return zero.textDecode(input);
}

export function now(): number {
    return w.now();
}

const loader = w.loader();

export function load<T extends keyof ResultTypes>(url: string, type: T, onProgress?: (loaded: number, total: number, url: string) => void): Promise<ResultTypes[T]> {
    return new Promise((resolve, reject) => {
        loader.load(url, type, (res: any) => {
            if (res.error) {
                reject(res.error);
                return;
            }
            switch (type) {
                case "text":
                    resolve(res.takeText());
                    break;
                case "buffer":
                    resolve(res.takeBuffer());
                    break;
                case "bitmap":
                    resolve(res.takeBitmap());
                    break;
            }
        });
    })
}

export async function loadWasm(url: string, imports: WebAssembly.Imports): Promise<WebAssembly.WebAssemblyInstantiatedSource> {
    return WebAssembly.instantiate(await load(url, 'buffer'), imports);
}

export function loadBundle(name: string): Promise<void> { throw new Error("unimplemented"); }

// export function ws(url: string) { return new WebSocket(url) }

export function attach(listener: EventListener) {
    w.onTouchStart(function (event: any) {
        listener.onTouchStart(new TouchEventImpl(event));
    })
    w.onTouchMove(function (event: any) {
        listener.onTouchMove(new TouchEventImpl(event))
    })
    w.onTouchEnd(function (event: any) {
        listener.onTouchEnd(new TouchEventImpl(event))
    })

    w.onWheel(function (event: any) {
        listener.onWheel(new WheelEventImpl(event))
    })

    w.onFrame(function () {
        listener.onFrame();
    });
}

export function detach(listener: EventListener) { throw new Error("unimplemented"); }

export function reboot() { throw new Error("unimplemented"); }