import Input from "../../core/Input.js";
import Zero from "../../core/Zero.js";
import WebLoader from "./WebLoader.js";
import WebPlatfrom from "./WebPlatform.js";

const DEBUG_DT_THRESHOLD = 1;

export default {
    run(canvas: HTMLCanvasElement, App: new () => Zero) {
        (window as any).zero = new App();
        zero.initialize(new WebLoader, new WebPlatfrom, canvas.width, canvas.height);

        const input = zero.input;
        canvas.addEventListener("mousedown", (mouseEvent) => {
            input.emit(Input.Event.TOUCH_START, { touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] })
        })
        canvas.addEventListener("mousemove", (mouseEvent) => {
            if (mouseEvent.buttons) {
                input.emit(Input.Event.TOUCH_MOVE, { touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] })
            }
        })
        canvas.addEventListener("mouseup", (mouseEvent) => {
            input.emit(Input.Event.TOUCH_END, { touches: [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }] })
        })

        canvas.addEventListener("wheel", (wheelEvent) => {
            input.emit(Input.Event.GESTURE_PINCH, wheelEvent.deltaY);
        })

        let requestId: number;
        let time: number = performance.now();

        function mainLoop(now: number) {
            let dt = now > time ? (now - time) / 1000 : 0;
            if (dt > DEBUG_DT_THRESHOLD) {
                dt = 1 / 60;
            }
            time = now;
            zero.tick(dt)
            requestId = window.requestAnimationFrame(mainLoop);
        }

        mainLoop(time);
    }
}

