import { CommandBuffer } from "gfx";
import { Flow } from "./pipeline/index.js";
import { Camera } from "./scene/Camera.js";

export class Pipeline {
    constructor(readonly flows: readonly Flow[]) { }

    update() {
        for (const flow of this.flows) {
            flow.update();
        }
    }

    record(commandBuffer: CommandBuffer, cameras: readonly Camera[]): number {
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