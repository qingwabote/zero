// load implementations first
import "./impl.js";
//
import { InputEvent, Zero } from "engine-main";

export function run(canvas: HTMLCanvasElement, App: new (...args: ConstructorParameters<typeof Zero>) => Zero) {
    const zero = new App();

    const name2event: Map<InputEvent, any> = new Map;
    canvas.addEventListener("mousedown", (mouseEvent) => {
        name2event.set(InputEvent.TOUCH_START, { touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] });
    })
    canvas.addEventListener("mousemove", (mouseEvent) => {
        if (mouseEvent.buttons) {
            name2event.set(InputEvent.TOUCH_MOVE, { touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] })
        }
    })
    canvas.addEventListener("mouseup", (mouseEvent) => {
        name2event.set(InputEvent.TOUCH_END, { touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] })
    })

    canvas.addEventListener("wheel", (wheelEvent) => {
        name2event.set(InputEvent.GESTURE_PINCH, { delta: wheelEvent.deltaY });
    })

    let requestId: number;

    function mainLoop(timestamp: number) {
        zero.tick(name2event, timestamp);
        name2event.clear();

        requestId = window.requestAnimationFrame(mainLoop);
    }

    mainLoop(performance.now());
}
