const pixelRatio: number = devicePixelRatio;
let canvasBoundingClientRect: DOMRect;

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

export function attach(canvas: HTMLCanvasElement, listener: EventListener) {
    canvasBoundingClientRect = canvas.getBoundingClientRect();

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