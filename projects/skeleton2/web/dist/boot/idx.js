// load console first
import { log } from "./console.js";
//
import { Device } from "gfx";
const pixelRatio = devicePixelRatio;
const pixelWidth = document.documentElement.clientWidth * pixelRatio;
const pixelHeight = document.documentElement.clientHeight * pixelRatio;
const canvas = document.getElementById('boot_canvas');
canvas.width = pixelWidth;
canvas.height = pixelHeight;
canvas.style.width = `${document.documentElement.clientWidth}px`;
canvas.style.height = `${document.documentElement.clientHeight}px`;
export const safeArea = (function () {
    const top = document.getElementById("boot_log").clientHeight * pixelRatio;
    return { left: 0, right: 0, top, bottom: 0, width: pixelWidth, height: pixelHeight - top };
})();
export const platform = 'web';
const canvasBoundingClientRect = canvas.getBoundingClientRect();
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
export const device = new Device(canvas.getContext('webgl2', { antialias: false }));
export const initial = performance.now();
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
export function textEncode(source, destination) {
    return textEncoder.encodeInto(source, destination).written;
}
export function textDecode(input) {
    return textDecoder.decode(input);
}
export function now() { return performance.now(); }
export function load(url, type, onProgress) {
    return new Promise((resolve, reject) => {
        function rej(reason) {
            log(reason);
            reject(reason);
        }
        const xhr = new XMLHttpRequest();
        switch (type) {
            case 'text':
                xhr.responseType = 'text';
                break;
            case 'buffer':
                xhr.responseType = 'arraybuffer';
                break;
            case 'bitmap':
                xhr.responseType = 'blob';
                break;
        }
        xhr.open('GET', url, true);
        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 0) {
                if (type == "bitmap") {
                    createImageBitmap(xhr.response, { premultiplyAlpha: 'none' }).then(resolve);
                }
                else {
                    resolve(xhr.response);
                }
            }
            else {
                rej(`download failed: ${url}, status: ${xhr.status}(no response)`);
            }
        };
        xhr.onprogress = (event) => {
            log(`download: ${url}, progress: ${event.loaded / event.total * 100}`);
            onProgress === null || onProgress === void 0 ? void 0 : onProgress(event.loaded, event.total, url);
        };
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
    });
}
export async function loadWasm(url, imports) {
    return WebAssembly.instantiate(await load(url, 'buffer'), imports);
}
export function loadBundle(name) { throw new Error("unimplemented"); }
export function attach(listener) {
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
export function reboot() { throw new Error("unimplemented"); }
