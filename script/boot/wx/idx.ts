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

export const platform = 'wx';

const windowInfo = wx.getWindowInfo();
console.log('windowInfo', windowInfo)
const windowWidth: number = windowInfo.windowWidth;
const windowHeight: number = windowInfo.windowHeight;
const _safeArea = windowInfo.safeArea;

export const safeArea = {
    x: -windowWidth / 2,
    y: (-windowHeight / 2) + (windowHeight - _safeArea.bottom),
    width: _safeArea.width,
    height: _safeArea.height
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

declare const WXWebAssembly: any;
globalThis.WebAssembly = WXWebAssembly;
export function loadWasm(url: string, imports: WebAssembly.Imports): Promise<WebAssembly.WebAssemblyInstantiatedSource> {
    return WXWebAssembly.instantiate(url, imports);
}

export function loadBundle(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const task = wx.loadSubpackage({
            name,
            success: function () {
                console.log(`load ${name} success`);
                resolve();
            },
            fail: function () {
                reject(`load ${name} fail`);
            }
        });
        task.onProgressUpdate((res: any) => {
            console.log(`load ${name} ${res.progress}`)
            // console.log('已经下载的数据长度', res.totalBytesWritten)
            // console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
        })
    })
}

interface ListenerHandle {
    onTouchStart: (event: any) => void;
    onTouchMove: (event: any) => void;
    onTouchEnd: (event: any) => void;
    onTouchCancel: (event: any) => void;
    onFrame: number;
}

const listener2handle: Map<EventListener, ListenerHandle> = new Map;

let touchEvent: TouchEvent;
export function attach(listener: EventListener) {

    const handle: ListenerHandle = {
        onTouchStart: function (event: any) {
            const touches: Touch[] = (event.touches as any[]).map(touch => { return { x: touch.clientX, y: touch.clientY } })
            listener.onTouchStart(touchEvent = { touches });
        },
        onTouchMove: function (event: any) {
            const touches: Touch[] = (event.touches as any[]).map(touch => { return { x: touch.clientX, y: touch.clientY } })
            listener.onTouchMove(touchEvent = { touches });
        },
        onTouchEnd: function (event: any) {
            listener.onTouchEnd(touchEvent);
        },
        onTouchCancel: function (event: any) {
            listener.onTouchEnd(touchEvent);
        },
        onFrame: requestAnimationFrame(function loop() {
            listener.onFrame();
            if (handle.onFrame == 0) return;
            handle.onFrame = requestAnimationFrame(loop);
        })
    }

    wx.onTouchStart(handle.onTouchStart)
    wx.onTouchMove(handle.onTouchMove)
    wx.onTouchEnd(handle.onTouchEnd)
    wx.onTouchCancel(handle.onTouchCancel)

    listener2handle.set(listener, handle);
}

export function detach(listener: EventListener) {
    const handle = listener2handle.get(listener)!;
    wx.offTouchStart(handle.onTouchStart)
    wx.offTouchMove(handle.onTouchMove)
    wx.offTouchEnd(handle.onTouchEnd)
    wx.offTouchCancel(handle.onTouchCancel)

    cancelAnimationFrame(handle.onFrame);
    handle.onFrame = 0 // mark to stop the loop if in loop

    listener2handle.delete(listener);
}

export function reboot() {
    wx.restartMiniProgram();
}