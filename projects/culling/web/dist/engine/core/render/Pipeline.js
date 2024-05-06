import { Zero } from "../Zero.js";
export class Pipeline {
    constructor(data, ubos, _flows) {
        this.data = data;
        this.ubos = ubos;
        this._flows = _flows;
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
        for (const flow of this._flows) {
            if (camera.visibilities & flow.visibilities) {
                flow.record(profile, commandBuffer, cameraIndex);
            }
        }
    }
}
