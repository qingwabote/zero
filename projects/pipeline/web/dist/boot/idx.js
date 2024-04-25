// load console first
import { log } from "./console.js";
//
import { Device } from "gfx";
const [styleWidth, styleHeight, bufferWidth, bufferHeight, ratio] = (function () {
    const { clientWidth, clientHeight } = document.documentElement;
    return [clientWidth, clientHeight, clientWidth * devicePixelRatio, clientHeight * devicePixelRatio, devicePixelRatio];
})();
const canvas = document.getElementById('boot_canvas');
canvas.width = bufferWidth;
canvas.height = bufferHeight;
canvas.style.width = `${styleWidth}px`;
canvas.style.height = `${styleHeight}px`;
export const safeArea = (function () {
    const top = document.getElementById("boot_log").clientHeight * ratio;
    return { left: 0, right: 0, top, bottom: 0, width: bufferWidth, height: bufferHeight - top };
})();
export const platform = 'web';
export const device = new Device(canvas.getContext('webgl2', { antialias: false }));
export const initial = performance.now();
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
    let lastTouch;
    canvas.addEventListener('touchstart', function (touchEvent) {
        const touch = touchEvent.touches[0];
        const rect = canvas.getBoundingClientRect();
        const offsetX = touch.clientX - rect.x;
        const offsetY = touch.clientY - rect.y;
        listener.onTouchStart({ touches: [lastTouch = { x: offsetX * ratio, y: offsetY * ratio }] });
        touchEvent.preventDefault(); // prevent mousedown
    });
    canvas.addEventListener('touchmove', function (touchEvent) {
        const touch = touchEvent.touches[0];
        const rect = canvas.getBoundingClientRect();
        const offsetX = touch.clientX - rect.x;
        const offsetY = touch.clientY - rect.y;
        listener.onTouchMove({ touches: [lastTouch = { x: offsetX * ratio, y: offsetY * ratio }] });
    });
    canvas.addEventListener('touchend', function (touchEvent) {
        listener.onTouchEnd({ touches: [lastTouch] });
    });
    canvas.addEventListener('touchcancel', function (touchEvent) {
        listener.onTouchEnd({ touches: [lastTouch] });
    });
    canvas.addEventListener("mousedown", function (mouseEvent) {
        listener.onTouchStart({ touches: [{ x: mouseEvent.offsetX * ratio, y: mouseEvent.offsetY * ratio }] });
    });
    canvas.addEventListener("mouseup", function (mouseEvent) {
        listener.onTouchEnd({ touches: [{ x: mouseEvent.offsetX * ratio, y: mouseEvent.offsetY * ratio }] });
    });
    canvas.addEventListener("mousemove", function (mouseEvent) {
        if (mouseEvent.buttons) {
            listener.onTouchMove({ touches: [{ x: mouseEvent.offsetX * ratio, y: mouseEvent.offsetY * ratio }] });
        }
    });
    canvas.addEventListener("wheel", function (wheelEvent) {
        listener.onGesturePinch({ touches: [{ x: wheelEvent.offsetX * ratio, y: wheelEvent.offsetY * ratio }], delta: wheelEvent.deltaY });
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
