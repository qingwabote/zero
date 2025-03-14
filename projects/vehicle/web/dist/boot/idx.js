// load console first
import { log } from "./console.js";
import { Device } from "gfx";
import * as loop from "./loop.js";
export const WebSocket = globalThis.WebSocket;
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
    const module = await WebAssembly.compile(await load(url, 'buffer'));
    const instance = await WebAssembly.instantiate(module, imports);
    return { module, instance };
}
export function loadBundle(name) { throw new Error("unimplemented"); }
export function attach(listener) {
    loop.attach(canvas, listener);
}
export function detach(listener) {
    loop.detach(listener);
}
export function reboot() { throw new Error("unimplemented"); }
