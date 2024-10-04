import { CommandBuffer, RenderPass } from "gfx";
import { Context } from "./Context.js";
import { Profile } from "./Profile.js";

export abstract class Phase {
    constructor(protected _context: Context, readonly visibility: number) { }
    abstract update(commandBuffer: CommandBuffer): void;
    abstract render(profile: Profile, commandBuffer: CommandBuffer, renderPass: RenderPass): void;
}