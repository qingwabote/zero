import { run as engine_run } from "engine-web";
import App from "../main/App.js";

export function run(canvas: HTMLCanvasElement) {
    engine_run(canvas, App)
}