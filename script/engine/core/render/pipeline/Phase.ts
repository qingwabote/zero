import { CommandBuffer, RenderPass } from "gfx";
import { Camera } from "../scene/Camera.js";
import { Root } from "../scene/Root.js";

export abstract class Phase {
    constructor(readonly visibility = 0) { }

    abstract record(commandBuffer: CommandBuffer, scene: Root, camera: Camera, renderPass: RenderPass): number;
}