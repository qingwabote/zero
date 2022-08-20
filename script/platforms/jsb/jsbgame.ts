import gfx from "../../core/gfx.js";
import Device from "../../core/gfx/Device.js";

export default {
    init(device: Device) {
        gfx.init(device);
        console.log("commandBuffer", device.commandBuffer);

        // game.init(new WebInput(canvas), new WebLoader, canvas.width, canvas.height)
    },

    tick(dt: number) {
        // game.tick(dt);
    }
}

