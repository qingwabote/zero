import { WebDevice, WebImpl } from "gfx-webgl";
import WebLoader from "./WebLoader.js";

const canvas = window.document.getElementById("ZeroCanvas") as HTMLCanvasElement;
const gl = canvas.getContext('webgl2', { alpha: false, antialias: false })!;
const device = new WebDevice(gl, canvas.width, canvas.height);
const loader = new WebLoader;
const gfx = new WebImpl;

(globalThis as any).zero = { loader, gfx, device }