import Device from "./gfx/Device.js";
import { Quat } from "./math/quat.js";
import { Vec3 } from "./math/vec3.js";

export enum Format {
    R8UI,
    R16UI,
    RG32F,
    RGB32F
}

interface FormatInfo {
    readonly name: string;
    readonly size: number
    readonly count: number;
}

export const FormatInfos: Readonly<FormatInfo[]> = [
    { name: "R8UI", size: 1, count: 1 },
    { name: "R16UI", size: 2, count: 1 },
    { name: "RG32F", size: 8, count: 2 },
    { name: "RGB32F", size: 12, count: 3 },
]

let _device: Device

export default {
    get device(): Device {
        return _device;
    },

    init(device: Device) {
        _device = device;
    }
}