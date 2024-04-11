import { CommandBuffer } from "gfx";
import { Zero } from "../Zero.js";
import { CommandCalls } from "./pipeline/CommandCalls.js";
import { Flow } from "./pipeline/Flow.js";
import { UBO } from "./pipeline/UBO.js";

export class Pipeline {
    constructor(readonly ubos: readonly UBO[], private readonly _flows: readonly Flow[]) { }

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

    record(commandCalls: CommandCalls, commandBuffer: CommandBuffer, cameraIndex: number) {
        const camera = Zero.instance.scene.cameras[cameraIndex];

        for (const flow of this._flows) {
            if (camera.visibilities & flow.visibilities) {
                flow.record(commandCalls, commandBuffer, cameraIndex);
            }
        }
    }
}