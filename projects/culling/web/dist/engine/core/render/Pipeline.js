export class Pipeline {
    constructor(flows) {
        this.flows = flows;
    }
    update() {
        for (const flow of this.flows) {
            flow.update();
        }
    }
    record(commandBuffer, cameras) {
        let dc = 0;
        for (let i = 0; i < cameras.length; i++) {
            for (const flow of this.flows) {
                flow.context.cameraIndex = i;
                dc += flow.record(commandBuffer);
            }
        }
        return dc;
    }
}
