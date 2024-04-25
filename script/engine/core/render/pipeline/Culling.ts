import { Model } from "../scene/Model.js";
import { ModelCollectionReadonly } from "../scene/ModelCollection.js";

export interface Culling {
    cull(models: ModelCollectionReadonly, cameraIndex: number): Model[];
}