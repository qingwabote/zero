import { CommandBuffer, RenderPass } from "gfx";

export abstract class Phase {
    constructor(readonly visibility = 0) { }

    abstract record(commandBuffer: CommandBuffer, renderPass: RenderPass): number;
}