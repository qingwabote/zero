import game from "../../core/game.js";
import gfx from "../../core/gfx.js";
import { WebGLDevice } from "./gfx/WebGLDevice.js";

gfx.init(new WebGLDevice)

let requestId: number;

let time: number = 0;

function mainLoop() {
    const now = Date.now()
    const dt = now > time ? (now - time) / 1000 : 0;
    time = now;
    game.tick(dt)
    requestId = window.requestAnimationFrame(mainLoop);
}

mainLoop();

