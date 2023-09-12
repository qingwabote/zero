import type { Device, Impl } from "gfx-main";
import type { Loader } from "../base/Loader.js";

const zero = (globalThis as any).zero;

export const loader: Loader = zero.loader;
export const gfx: Impl = zero.gfx;
export const device: Device = zero.device;
