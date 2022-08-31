import Device from "./gfx/Device.js";

let _device: Device

export default {
    get device(): Device {
        return _device;
    },

    init(device: Device) {
        _device = device;
    }
}