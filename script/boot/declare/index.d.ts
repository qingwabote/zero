import { Device } from 'gfx';

export declare interface TouchEvent {
    get count(): number;
    x(index: number): number;
    y(index: number): number;
}

export declare interface WheelEvent extends TouchEvent {
    get delta(): number;
}

export declare interface EventListener {
    onTouchStart(event: TouchEvent): void;
    onTouchMove(event: TouchEvent): void;
    onTouchEnd(event: TouchEvent): void;
    onWheel(event: WheelEvent): void;
    onFrame(): void;
}

export declare const platform: 'jsb' | 'web' | 'wx';

export declare const safeArea: {
    readonly left: number,
    readonly right: number,
    readonly top: number,
    readonly bottom: number,
    readonly width: number,
    readonly height: number
};

export declare const device: Device;

export declare const initial: number;

export declare function textEncode(source: string, destination: Uint8Array): number;
export declare function textDecode(input: Uint8Array): string;

/**milliseconds */
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
