import { Model } from "../scene/Model.js";
import { ModelCollection } from "../scene/ModelCollection.js";

export interface Culler {
    cull(results: Model[], models: ModelCollection.Readonly, type: string, cameraIndex: number): void;
}