import { Model } from "../scene/Model.js";

export interface Culling {
    ready(): void;
    cull(model: Model, cameraIndex: number): boolean;
}