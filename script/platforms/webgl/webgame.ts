import { InputEvent } from "../../main/core/Input.js";
import Zero from "../../main/core/Zero.js";
import WebLoader from "./WebLoader.js";
import WebPlatfrom from "./WebPlatform.js";

export default {
    async run(canvas: HTMLCanvasElement, App: new (...args: ConstructorParameters<typeof Zero>) => Zero) {
        (window as any).loader = new WebLoader;
        (window as any).platform = new WebPlatfrom;
        (window as any).zero = new App(canvas.width, canvas.height);
        await zero.initialize();

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

        function mainLoop() {
            zero.tick(name2event);
            name2event.clear();

            requestId = window.requestAnimationFrame(mainLoop);
        }

        mainLoop();
    }
}

