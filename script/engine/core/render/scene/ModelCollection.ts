import { Frustum } from "./Frustum.js";
import { Model } from "./Model.js";

interface ModelCollectionReadonly extends Iterable<Model> {
    culler(times?: number): (frustum: Readonly<Frustum>, visibilities: number, type?: string) => Model[]
}

export interface ModelCollection extends ModelCollectionReadonly {
    add(model: Model): void;
    update(model: Model): void;
}

export declare namespace ModelCollection {
    export { ModelCollectionReadonly as Readonly }
}