import { CommandBuffer, RenderPass } from "gfx-main";
import { Camera } from "../scene/Camera.js";

export abstract class Phase {
    protected _drawCalls: number = 0;
    get drawCalls() {
        return this._drawCalls;
    }

    constructor(readonly visibility = 0) { }

    abstract record(commandBuffer: CommandBuffer, camera: Camera, renderPass: RenderPass): void;
}