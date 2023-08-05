import { SubMesh } from "../core/render/scene/SubMesh.js";

export interface Mesh {
    readonly subMeshes: readonly SubMesh[];
}