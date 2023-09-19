import type { Impl } from "gfx-main";
import { WebDevice, info } from "gfx-webgl";
import WebLoader from "./WebLoader.js";

const canvas = document.getElementById("ZeroCanvas") as HTMLCanvasElement;
const gl = canvas.getContext('webgl2', { alpha: false, antialias: false })!;
const device = new WebDevice(gl, canvas.width, canvas.height);
const loader = new WebLoader;
const gfx: Impl = info;

(globalThis as any).zero = { loader, gfx, device }