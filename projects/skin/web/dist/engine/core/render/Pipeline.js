import { Zero } from "../Zero.js";
export class Pipeline {
    constructor(data, ubos, flows) {
        this.data = data;
        this.ubos = ubos;
        this.flows = flows;
        this._dumping = false;
    }
    dump() {
        this._dumping = true;
    }
    update() {
        this.data.update(this._dumping);
        for (const ubo of this.ubos) {
            ubo.update(this._dumping);
        }
        this._dumping = false;
    }
    record(profile, commandBuffer, cameraIndex) {
        const camera = Zero.instance.scene.cameras[cameraIndex];
        for (const flow of this.flows) {
            if (camera.visibilities & flow.visibilities) {
                flow.record(profile, commandBuffer, cameraIndex);
            }
        }
    }
}
