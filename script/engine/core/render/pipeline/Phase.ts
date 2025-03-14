import { RecycleQueue } from "bastard";
import { CommandBuffer } from "gfx";
import { Context } from "../Context.js";
import { Pass } from "../scene/Pass.js";
import { Batch } from "./Batch.js";

export abstract class Phase {
    constructor(readonly visibility: number) { }
    abstract batch(out: RecycleQueue<Map<Pass, Batch[]>>, context: Context, commandBuffer: CommandBuffer, cameraIndex: number): void;
}