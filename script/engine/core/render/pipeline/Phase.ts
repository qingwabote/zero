import { CommandBuffer, RenderPass } from "gfx";
import { Context } from "../Context.js";

export abstract class Phase {
    constructor(protected _context: Context, readonly visibility = 0) { }

    abstract record(commandBuffer: CommandBuffer, renderPass: RenderPass): number;
}