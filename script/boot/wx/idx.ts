// load implementations first
import "./impl/index.js";

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
    onFrame(timestamp: number): void;
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
        listener.onFrame(performance.now());
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}