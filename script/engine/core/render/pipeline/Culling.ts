import { Model } from "../scene/Model.js";
import { ModelCollectionReadonly } from "../scene/ModelCollection.js";

export interface Culling {
    cull(models: ModelCollectionReadonly, type: string, cameraIndex: number): Model[];
}