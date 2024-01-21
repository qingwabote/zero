export class Pipeline {
    constructor(_flows) {
        this._flows = _flows;
    }
    update() {
        for (const flow of this._flows) {
            flow.update();
        }
    }
    record(commandBuffer, cameras) {
        let dc = 0;
        for (let i = 0; i < cameras.length; i++) {
            for (const flow of this._flows) {
                flow.context.cameraIndex = i;
                dc += flow.record(commandBuffer);
            }
        }
        return dc;
    }
}
