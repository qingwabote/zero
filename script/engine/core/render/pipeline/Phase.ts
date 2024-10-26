import { Context } from "../Context.js";
import { Pass } from "../scene/Pass.js";
import { Batch } from "./Batch.js";

export abstract class Phase {
    constructor(readonly visibility: number) { }
    abstract queue(buffer_pass: Pass[], buffer_batch: Batch[], buffer_index: number, context: Context, cameraIndex: number): number;
}