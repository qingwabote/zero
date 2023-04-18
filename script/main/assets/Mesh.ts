import SubMesh from "../core/scene/SubMesh.js";

export default interface Mesh {
    readonly subMeshes: readonly SubMesh[];
}