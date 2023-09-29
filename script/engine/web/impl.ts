
import { Device } from "gfx";
import WebLoader from "./WebLoader.js";

// for gfx webgl2
const canvas = document.getElementById("ZeroCanvas") as HTMLCanvasElement;
const gl = canvas.getContext('webgl2', { alpha: false, antialias: false })!;
(globalThis as any).gfx = {
    context: gl,
    width: canvas.width,
    height: canvas.height
}

const loader = new WebLoader;

// for phys ammo
(globalThis as any).phys = {
    getWasm: function () {
        return loader.load('../../assets/physics/ammo.wasm.wasm', 'arraybuffer');
    }
};

(globalThis as any).zero = { loader, device: new Device }