import type { Device } from "gfx-main";
import type { Loader } from "../base/Loader.js";

while (!(globalThis as any)._zero_device) {
    await Promise.resolve();
}

export const device: Device = (globalThis as any)._zero_device;
export const loader: Loader = (globalThis as any)._zero_loader;