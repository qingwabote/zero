import { CommandBuffer, RenderPass } from "gfx";
import { CommandCalls } from "./CommandCalls.js";
import { Context } from "./Context.js";

export abstract class Phase {
    constructor(protected _context: Context, readonly visibility: number) { }

    abstract record(commandCalls: CommandCalls, commandBuffer: CommandBuffer, renderPass: RenderPass, cameraIndex: number): void;
}