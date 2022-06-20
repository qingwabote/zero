export interface Device{}

let _device:Device

export default {
    get device():Device {
        return _device;
    },
    
    init(device:Device) {
        _device = device;
    }
}