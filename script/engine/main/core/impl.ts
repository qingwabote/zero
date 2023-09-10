import type { Device, Impl } from "gfx-main";
import type { Loader } from "../base/Loader.js";

// Perhaps these global variables should be replaced by some module variables, but it is complex to implement in JSB

export const loader: Loader = (globalThis as any)._zero_loader;

export const gfx: Impl = (globalThis as any)._zero_gfx;
export const device: Device = (globalThis as any)._zero_device;
