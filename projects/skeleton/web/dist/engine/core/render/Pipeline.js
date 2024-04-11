import { Zero } from "../Zero.js";
export class Pipeline {
    constructor(ubos, _flows) {
        this.ubos = ubos;
        this._flows = _flows;
    }
    use() {
        for (const ubo of this.ubos) {
            ubo.visibilities = 0;
        }
        for (const flow of this._flows) {
            flow.use();
        }
        for (const ubo of this.ubos) {
            ubo.use();
        }
    }
    update() {
        for (const ubo of this.ubos) {
            ubo.update();
        }
    }
    record(commandCalls, commandBuffer, cameraIndex) {
        const camera = Zero.instance.scene.cameras[cameraIndex];
        for (const flow of this._flows) {
            if (camera.visibilities & flow.visibilities) {
                flow.record(commandCalls, commandBuffer, cameraIndex);
            }
        }
    }
}
