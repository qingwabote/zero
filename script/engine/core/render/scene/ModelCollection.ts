import { Frustum } from "./Frustum.js";
import { Model } from "./Model.js";

export interface ModelCollectionReadonly extends Iterable<Model> {
    cull(times?: number): (frustum: Readonly<Frustum>, visibilities: number, type?: string) => Model[]
}

export interface ModelCollection extends ModelCollectionReadonly {
    add(model: Model): void;
    update(model: Model): void;
}