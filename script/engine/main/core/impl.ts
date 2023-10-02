import type { Device } from "gfx";

const zero = (globalThis as any).zero;

export const device: Device = zero.device;
