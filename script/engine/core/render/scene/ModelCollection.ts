import { Frustum } from "./Frustum.js";
import { Model } from "./Model.js";

interface ModelCollectionReadonly extends Iterable<Model> {
    culler(distinct?: boolean): (results: Model[], frustum: Readonly<Frustum>, visibilities: number) => void;
}

export interface ModelCollection extends ModelCollectionReadonly {
    add(model: Model): void;
    update(model: Model): void;
}

export declare namespace ModelCollection {
    export { ModelCollectionReadonly as Readonly }
}