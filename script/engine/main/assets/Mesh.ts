import { SubMesh } from "../core/scene/SubMesh.js";

export interface Mesh {
    readonly subMeshes: readonly SubMesh[];
}