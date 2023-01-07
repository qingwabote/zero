import CommandBuffer from "../gfx/CommandBuffer.js";
import RenderCamera from "../render/RenderCamera.js";
import VisibilityBit from "../render/VisibilityBit.js";
import PipelineUniform from "./PipelineUniform.js";

export default abstract class RenderPhase {
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

    abstract getRequestedUniforms(): (new () => PipelineUniform)[];
    abstract record(commandBuffer: CommandBuffer, camera: RenderCamera): void;
}