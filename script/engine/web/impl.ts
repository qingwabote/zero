import { WebDevice, WebImpl } from "gfx-webgl";
import WebLoader from "./WebLoader.js";

(window as any)._zero_loader = new WebLoader;


(window as any)._zero_gfx = new WebImpl;

const canvas = window.document.getElementById("ZeroCanvas") as HTMLCanvasElement;
const gl = canvas.getContext('webgl2', { alpha: false, antialias: false })!;
(window as any)._zero_device = new WebDevice(gl, canvas.width, canvas.height);