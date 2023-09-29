// load implementations first
import "./impl/index.js";
//
import { InputEvent, Touch, TouchEvent, Zero } from "engine-main";

declare const wx: any;

export function run(App: new (...args: ConstructorParameters<typeof Zero>) => Zero) {
    const app = new App();

    const name2event: Map<InputEvent, any> = new Map;

    let lastEvent: TouchEvent;

    wx.onTouchStart(function (event: any) {
        const touches: Touch[] = (event.touches as any[]).map(touch => { return { x: touch.clientX, y: touch.clientY } })
        name2event.set(InputEvent.TOUCH_START, lastEvent = { touches });
    })
    wx.onTouchMove(function (event: any) {
        const touches: Touch[] = (event.touches as any[]).map(touch => { return { x: touch.clientX, y: touch.clientY } })
        name2event.set(InputEvent.TOUCH_MOVE, lastEvent = { touches });
    })
    wx.onTouchEnd(function (event: any) {
        name2event.set(InputEvent.TOUCH_END, lastEvent);
    })
    wx.onTouchCancel(function (event: any) {
        name2event.set(InputEvent.TOUCH_END, lastEvent);
    })

    const performance = wx.getPerformance()
    function mainLoop() {
        app.tick(name2event, performance.now());
        name2event.clear();

        requestAnimationFrame(mainLoop);
    }

    mainLoop();
}
