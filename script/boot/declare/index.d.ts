import { Device } from 'gfx';

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
    onFrame(): void;
}

export declare const platform: 'jsb' | 'web' | 'wx';

export declare const safeArea: { x: number, y: number, width: number, height: number };

export declare const device: Device;

export declare const initial: number;

export declare function now(): number;

export declare interface ResultTypes {
    text: string,
    buffer: ArrayBuffer,
    bitmap: ImageBitmap
}

export declare function load<T extends keyof ResultTypes>(url: string, type: T, onProgress?: (loaded: number, total: number, url: string) => void): Promise<ResultTypes[T]>;

export declare function loadWasm(url: string, imports: WebAssembly.Imports): Promise<WebAssembly.WebAssemblyInstantiatedSource>;

export declare function loadBundle(name: string): Promise<void>;

export declare function attach(listener: EventListener);

export declare function detach(listener: EventListener);

export declare function reboot();

