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

declare const zero: any;

const w = zero.Window.instance();

export const device = w.device();

export const initial: number = w.now();

export function now(): number {
    return w.now();
}

export interface ResultTypes {
    text: string,
    buffer: ArrayBuffer,
    bitmap: ImageBitmap
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

export function listen(listener: EventListener) {
    w.onTouchStart(function (event: any) {
        const touch = event.touches.get(0);
        listener.onTouchStart({ touches: [touch] });
    })
    w.onTouchMove(function (event: any) {
        const touch = event.touches.get(0);
        listener.onTouchMove({ touches: [touch] })
    })
    w.onTouchEnd(function (event: any) {
        const touch = event.touches.get(0);
        listener.onTouchEnd({ touches: [touch] })
    })

    w.onFrame(function () {
        listener.onFrame();
    });
}