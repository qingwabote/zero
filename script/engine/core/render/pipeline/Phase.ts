import { Context } from "../Context.js";
import { BatchQueue } from "./BatchQueue.js";

export abstract class Phase {
    constructor(readonly visibility: number) { }
    abstract batch(out: BatchQueue, context: Context, cameraIndex: number): void;
}