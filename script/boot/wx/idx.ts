import { Device } from "gfx";

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

declare const wx: any;

// copy from weapp-adapter.9568fddf
if (wx.getPerformance) {
    const { platform } = wx.getSystemInfoSync()
    const wxPerf = wx.getPerformance()
    const initTime = wxPerf.now()
    const clientPerfAdapter = Object.assign({}, wxPerf, {
        now: function () {
            return (wxPerf.now() - initTime) / 1000
        }
    })
    globalThis.performance = platform === 'devtools' ? wxPerf : clientPerfAdapter
}

export interface EventListener {
    onTouchStart(event: TouchEvent): void;
    onTouchMove(event: TouchEvent): void;
    onTouchEnd(event: TouchEvent): void;
    onGesturePinch(event: GestureEvent): void;
    onGestureRotate(event: GestureEvent): void;
    onFrame(): void;
}

const canvas = wx.createCanvas()
const gl = canvas.getContext('webgl2', { alpha: false, antialias: false })!;
globalThis.WebGL2RenderingContext = gl;

export const device = new Device(gl);

export const initial = performance.now();

export function now() {
    return performance.now();
}

const ext2txt = ['fs', 'vs', 'chunk', 'yml'];

const fs = wx.getFileSystemManager();

interface ResultTypes {
    text: string,
    buffer: ArrayBuffer,
    bitmap: ImageBitmap
}

export function load<T extends keyof ResultTypes>(url: string, type: T, onProgress?: (loaded: number, total: number, url: string) => void): Promise<ResultTypes[T]> {
    return new Promise((resolve, reject) => {
        const ext = url.substring(url.lastIndexOf('.') + 1);
        if (ext2txt.indexOf(ext) != -1) {
            url = url + '.txt'
        }

        if (type == 'bitmap') {
            const image = wx.createImage();
            image.onload = function () {
                resolve(image);
            }
            image.onerror = function (err: string) {
                reject(err);
            }
            image.src = url;
        } else {
            fs.readFile({
                filePath: url,
                encoding: type == 'text' ? 'utf8' : '',
                success: function (result: any) {
                    resolve(result.data)
                },
                fail: function (result: any) {
                    reject(result.errMsg);
                }
            });
        }
    })
}

export function listen(listener: EventListener) {
    let lastEvent: TouchEvent;

    wx.onTouchStart(function (event: any) {
        const touches: Touch[] = (event.touches as any[]).map(touch => { return { x: touch.clientX, y: touch.clientY } })
        listener.onTouchStart(lastEvent = { touches });
    })
    wx.onTouchMove(function (event: any) {
        const touches: Touch[] = (event.touches as any[]).map(touch => { return { x: touch.clientX, y: touch.clientY } })
        listener.onTouchMove(lastEvent = { touches });
    })
    wx.onTouchEnd(function (event: any) {
        listener.onTouchEnd(lastEvent);
    })
    wx.onTouchCancel(function (event: any) {
        listener.onTouchEnd(lastEvent);
    })

    function loop() {
        listener.onFrame();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}