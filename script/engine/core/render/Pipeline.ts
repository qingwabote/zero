import { CommandBuffer } from "gfx";
import { CommandCalls } from "./pipeline/CommandCalls.js";
import { Flow } from "./pipeline/Flow.js";

export class Pipeline {
    constructor(readonly flows: readonly Flow[]) { }

    update() {
        for (const flow of this.flows) {
            flow.update();
        }
    }

    record(commandCalls: CommandCalls, commandBuffer: CommandBuffer, cameraIndex: number) {
        for (const flow of this.flows) {
            flow.record(commandCalls, commandBuffer, cameraIndex);
        }
    }
}