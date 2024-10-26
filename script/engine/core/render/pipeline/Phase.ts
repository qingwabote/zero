import { CommandBuffer } from "gfx";
import { Scene } from "../Scene.js";
import { Pass } from "../scene/Pass.js";
import { Batch } from "./Batch.js";

export abstract class Phase {
    constructor(readonly visibility: number) { }
    abstract queue(buffer_pass: Pass[], buffer_batch: Batch[], buffer_index: number, commandBuffer: CommandBuffer, scene: Scene, cameraIndex: number): number;
}