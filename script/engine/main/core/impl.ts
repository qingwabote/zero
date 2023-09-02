import type { Device } from "gfx-main";
import type { Loader } from "../base/Loader.js";

export const device: Device = (globalThis as any)._zero_device;
export const loader: Loader = (globalThis as any)._zero_loader;