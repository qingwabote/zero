import CommandBuffer from "../gfx/CommandBuffer.js";
import RenderPass from "../gfx/RenderPass.js";
import Camera from "../render/Camera.js";

export default abstract class Phase {
    protected _drawCalls: number = 0;
    get drawCalls() {
        return this._drawCalls;
    }

    constructor(readonly visibility = 0) { }

    abstract record(commandBuffer: CommandBuffer, camera: Camera, renderPass: RenderPass): void;
}