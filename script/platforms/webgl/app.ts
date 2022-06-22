import game from "../../core/game.js";
import gfx from "../../core/gfx.js";
import WebCommandBuffer from "./gfx/WebCommandBuffer.js";
import WebDevice from "./gfx/WebDevice.js";

const DEBUG_DT_THRESHOLD = 1;

const canvas = document.querySelector<HTMLCanvasElement>('#GameCanvas')!;
const gl = canvas.getContext('webgl2')!;

gfx.init(new WebDevice(gl), new WebCommandBuffer(gl))

game.init()

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

