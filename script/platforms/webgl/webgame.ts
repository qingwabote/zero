import Asset from "../../core/assets/Asset.js";
import game from "../../core/game.js";
import gfx from "../../core/gfx.js";
import WebDevice from "./gfx/WebDevice.js";
import WebInput from "./WebInput.js";
import WebLoader from "./WebLoader.js";

const DEBUG_DT_THRESHOLD = 1;

export default {
    init(canvas: HTMLCanvasElement) {
        const gl = canvas.getContext('webgl2')!;
        gfx.init(new WebDevice(gl));
        Asset.loader = new WebLoader;
        game.init(new WebInput(canvas), canvas.width, canvas.height)
    },

    run() {
        let requestId: number;
        let time: number = performance.now();

        function mainLoop(now: number) {
            let dt = now > time ? (now - time) / 1000 : 0;
            if (dt > DEBUG_DT_THRESHOLD) {
                dt = 1 / 60;
            }
            time = now;
            game.tick(dt)
            requestId = window.requestAnimationFrame(mainLoop);
        }

        mainLoop(time);
    }
}

