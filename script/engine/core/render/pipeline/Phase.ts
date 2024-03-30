import { CommandBuffer, RenderPass } from "gfx";
import { Context } from "../Context.js";

export abstract class Phase {
    constructor(protected _context: Context, readonly visibility: number) { }

    abstract record(commandBuffer: CommandBuffer, renderPass: RenderPass, cameraIndex: number): number;
}