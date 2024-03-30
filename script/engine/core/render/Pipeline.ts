import { CommandBuffer } from "gfx";
import { Flow } from "./pipeline/index.js";

export class Pipeline {
    constructor(readonly flows: readonly Flow[]) { }

    update() {
        for (const flow of this.flows) {
            flow.update();
        }
    }

    record(commandBuffer: CommandBuffer, cameraIndex: number): number {
        let dc = 0;
        for (const flow of this.flows) {
            dc += flow.record(commandBuffer, cameraIndex);
        }
        return dc;
    }
}