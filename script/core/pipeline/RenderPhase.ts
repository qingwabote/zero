import CommandBuffer from "../gfx/CommandBuffer.js";
import RenderCamera from "../render/RenderCamera.js";
import VisibilityBit from "../render/VisibilityBit.js";
import PipelineUniform from "./PipelineUniform.js";

export default abstract class RenderPhase {
    private _visibility: VisibilityBit;
    get visibility(): VisibilityBit {
        return this._visibility;
    }

    constructor(visibility: VisibilityBit = VisibilityBit.ALL) {
        this._visibility = visibility;
    }

    abstract getRequestedUniforms(): (new () => PipelineUniform)[];
    abstract record(commandBuffer: CommandBuffer, camera: RenderCamera): void;
}