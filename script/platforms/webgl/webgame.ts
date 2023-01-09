import { InputEvent } from "../../core/Input.js";
import Zero from "../../core/Zero.js";
import WebLoader from "./WebLoader.js";
import WebPlatfrom from "./WebPlatform.js";

export default {
    run(canvas: HTMLCanvasElement, App: new () => Zero) {
        (window as any).zero = new App();
        zero.initialize(new WebLoader, new WebPlatfrom, canvas.width, canvas.height);

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

