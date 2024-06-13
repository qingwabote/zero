import { Model } from "../scene/Model.js";
import { ModelCollection } from "../scene/ModelCollection.js";

export interface Culler {
    cull(models: ModelCollection.Readonly, type: string, cameraIndex: number): Model[];
}