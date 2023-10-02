// load implementations first
import "./impl/index.js";
//
import { InputEvent, Zero } from "engine-main";

const zero = (globalThis as any).zero;

export function run(App: new (...args: ConstructorParameters<typeof Zero>) => Zero) {
    const app = new App();

    const name2event: Map<InputEvent, any> = new Map;
    zero.onTouchStart((event: any) => {
        const touch = event.touches.get(0);
        name2event.set(InputEvent.TOUCH_START, { touches: [touch] });
    })
    zero.onTouchMove((event: any) => {
        const touch = event.touches.get(0);
        name2event.set(InputEvent.TOUCH_MOVE, { touches: [touch] })
    })
    zero.onTouchEnd((event: any) => {
        const touch = event.touches.get(0);
        name2event.set(InputEvent.TOUCH_END, { touches: [touch] })
    })

    function mainLoop(timestamp: number) {
        app.tick(name2event, timestamp);
        name2event.clear();

        zero.requestAnimationFrame(mainLoop);
    }

    zero.requestAnimationFrame(mainLoop);
}