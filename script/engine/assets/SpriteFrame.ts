import { Texture } from "gfx";
import { vec3 } from "../core/math/vec3.js";
import { createInputAssembler } from "../core/render/quad.js";
import { SubMesh } from "../core/render/scene/SubMesh.js";
import { Mesh } from "./Mesh.js";

export class SpriteFrame {
    static readonly PIXELS_PER_UNIT = 100;

    readonly mesh: Mesh;

    constructor(readonly texture: Texture) {

        const width = texture.info.width / SpriteFrame.PIXELS_PER_UNIT;
        const height = texture.info.height / SpriteFrame.PIXELS_PER_UNIT;

        const subMesh = new SubMesh(
            createInputAssembler(width, height),
            vec3.create(-width / 2, -height / 2),
            vec3.create(width / 2, height / 2),
            {
                count: 6,
                first: 0
            }
        )
        this.mesh = { subMeshes: [subMesh] };
    }
}