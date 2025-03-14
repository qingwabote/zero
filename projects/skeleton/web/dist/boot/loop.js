const pixelRatio = devicePixelRatio;
let canvasBoundingClientRect;
class TouchEventImpl {
    get count() {
        return this._event.touches.length;
    }
    constructor(_event) {
        this._event = _event;
    }
    x(index) {
        return (this._event.touches[index].clientX - canvasBoundingClientRect.x) * pixelRatio;
    }
    y(index) {
        return (this._event.touches[index].clientY - canvasBoundingClientRect.y) * pixelRatio;
    }
}
class MouseEventImpl {
    get count() {
        return 1;
    }
    constructor(_event) {
        this._event = _event;
    }
    x(index) {
        return this._event.offsetX * pixelRatio;
    }
    y(index) {
        return this._event.offsetY * pixelRatio;
    }
}
class WheelEventImpl extends MouseEventImpl {
    get delta() {
        return -this._event.deltaY;
    }
}
export function attach(canvas, listener) {
    canvasBoundingClientRect = canvas.getBoundingClientRect();
    canvas.addEventListener('touchstart', function (touchEvent) {
        listener.onTouchStart(new TouchEventImpl(touchEvent));
        touchEvent.preventDefault(); // prevent mousedown
    });
    canvas.addEventListener('touchmove', function (touchEvent) {
        listener.onTouchMove(new TouchEventImpl(touchEvent));
    });
    canvas.addEventListener('touchend', function (touchEvent) {
        listener.onTouchEnd(new TouchEventImpl(touchEvent));
    });
    canvas.addEventListener('touchcancel', function (touchEvent) {
        listener.onTouchEnd(new TouchEventImpl(touchEvent));
    });
    canvas.addEventListener("mousedown", function (mouseEvent) {
        listener.onTouchStart(new MouseEventImpl(mouseEvent));
    });
    canvas.addEventListener("mouseup", function (mouseEvent) {
        listener.onTouchEnd(new MouseEventImpl(mouseEvent));
    });
    canvas.addEventListener("mousemove", function (mouseEvent) {
        if (mouseEvent.buttons) {
            listener.onTouchMove(new MouseEventImpl(mouseEvent));
        }
    });
    canvas.addEventListener("wheel", function (wheelEvent) {
        listener.onWheel(new WheelEventImpl(wheelEvent));
        wheelEvent.preventDefault();
    });
    function loop() {
        listener.onFrame();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}
export function detach(listener) { throw new Error("unimplemented"); }
