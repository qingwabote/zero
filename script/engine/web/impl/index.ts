import './ammo.js';
import './webgl2.js';
//
import { Device } from "gfx";
import WebLoader from "../WebLoader.js";

(globalThis as any).zero = { loader: WebLoader.instance, device: new Device }