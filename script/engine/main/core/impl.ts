import type { Device } from "gfx";
import type { Loader } from "../base/Loader.js";

const zero = (globalThis as any).zero;

export const loader: Loader = zero.loader;
export const device: Device = zero.device;
