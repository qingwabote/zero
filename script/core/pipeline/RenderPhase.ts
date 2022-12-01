import CommandBuffer from "../gfx/CommandBuffer.js";
import { DescriptorSet } from "../gfx/Pipeline.js";
import RenderCamera from "../render/RenderCamera.js";
import VisibilityBit from "../render/VisibilityBit.js";

export enum PhaseBit {
    DEFAULT = 1 << 1,
    SHADOWMAP = 1 << 2,
}

export default abstract class RenderPhase {
    private _visibility: VisibilityBit;
    get visibility(): VisibilityBit {
        return this._visibility;
    }

    constructor(visibility: VisibilityBit = VisibilityBit.ALL) {
        this._visibility = visibility;
    }

    abstract getRequestedUniforms(): Record<string, any>;
    abstract initialize(globalDescriptorSet: DescriptorSet): void;
    abstract record(commandBuffer: CommandBuffer, camera: RenderCamera): void;
}