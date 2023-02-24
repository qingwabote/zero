import CommandBuffer from "../gfx/CommandBuffer.js";
import RenderPass from "../gfx/RenderPass.js";
import Camera from "../render/Camera.js";
import VisibilityBit from "../render/VisibilityBit.js";

export default abstract class Phase {
    private _visibility: VisibilityBit;
    get visibility(): VisibilityBit {
        return this._visibility;
    }

    protected _drawCalls: number = 0;
    get drawCalls() {
        return this._drawCalls;
    }

    constructor(visibility: VisibilityBit = VisibilityBit.ALL) {
        this._visibility = visibility;
    }

    abstract record(commandBuffer: CommandBuffer, camera: Camera, renderPass: RenderPass): void;
}