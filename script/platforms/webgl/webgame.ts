import Zero from "../../core/Zero.js";
import WebDevice from "./gfx/WebDevice.js";
import WebInput from "./WebInput.js";
import WebLoader from "./WebLoader.js";

const DEBUG_DT_THRESHOLD = 1;

export default {
    run(canvas: HTMLCanvasElement, App: new () => Zero) {
        const gl = canvas.getContext('webgl2')!;
        (window as any).zero = new App();
        zero.initialize(new WebDevice(gl), new WebInput(canvas), new WebLoader, canvas.width, canvas.height);

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

