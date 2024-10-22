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
    update(profile) {
        this.data.update(profile, this._dumping);
    }
    upload(commandBuffer) {
        for (const ubo of this.ubos) {
            ubo.update(commandBuffer, this._dumping);
        }
        this._dumping = false;
    }
    record(profile, commandBuffer, cameras) {
        for (this.data.cameraIndex = 0; this.data.cameraIndex < cameras.length; this.data.cameraIndex++) {
            for (const flow of this.flows) {
                if (this.data.current_camera.visibilities & flow.visibilities) {
                    flow.record(profile, commandBuffer);
                }
            }
        }
    }
}
