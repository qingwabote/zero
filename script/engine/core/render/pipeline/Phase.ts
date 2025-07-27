import { Queue, RecycleQueue } from "bastard";
import { Scene } from "../Scene.js";
import { Pass } from "../scene/Pass.js";
import { Batch } from "./Batch.js";

export abstract class Phase {
    constructor(readonly visibility: number) { }
    abstract batch(out: RecycleQueue<Map<Pass, Queue<Batch>>>, scene: Scene, cameraIndex: number): void;
}