import Device from "./Device.js";

export enum Format {
    R8UI,
    RG32F,
    RGB32F
}

interface FormatInfo {
    readonly name: string;
    readonly size: number
    readonly count: number;
}

export const FormatInfos: Readonly<FormatInfo[]> = [
    { name: "R8UI", size: 2, count: 1 },
    { name: "RG32F", size: 8, count: 2 },
    { name: "RGB32F", size: 12, count: 3 },
]

export interface Transform {
    eulerX: number;
    eulerY: number;
    eulerZ: number;
}

let _device: Device

export default {
    get device(): Device {
        return _device;
    },

    init(device: Device) {
        _device = device;
    }
}