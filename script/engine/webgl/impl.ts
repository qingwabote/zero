import { WebDevice } from "gfx-webgl";
import WebLoader from "./WebLoader.js";

(window as any)._zero_loader = new WebLoader;
(window as any)._zero_device = new WebDevice(window.document.getElementById("ZeroCanvas") as HTMLCanvasElement);