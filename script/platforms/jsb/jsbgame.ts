import gfx from "../../core/gfx.js";
import Device from "../../core/gfx/Device.js";

export default {
    init(device: Device) {
        if (device.initialize()) {
            return true;
        }
        gfx.init(device);
        const pipeline = device.createPipeline();
        console.log("device.createPipline", pipeline);

        // game.init(new WebInput(canvas), new WebLoader, canvas.width, canvas.height)
        // return false;
        return false;
    },

    tick(dt: number) {
        // game.tick(dt);
    }
}

