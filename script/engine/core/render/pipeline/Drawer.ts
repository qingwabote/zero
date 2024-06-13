import { CommandBuffer, RenderPass } from "gfx";
import { Model } from "../scene/Model.js";
import { Context } from "./Context.js";

export interface Drawer {
    record(context: Context, commandBuffer: CommandBuffer, renderPass: RenderPass, pass: string, models: Model[]): number
}