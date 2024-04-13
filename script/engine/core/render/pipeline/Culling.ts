import { Model } from "../scene/Model.js";

export interface Culling {
    cull(model: Model, cameraIndex: number): boolean;
}