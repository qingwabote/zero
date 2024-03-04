import { Texture } from "gfx";
import { vec3 } from "../core/math/vec3.js";
import { quad } from "../core/render/quad.js";
import { Mesh } from "../core/render/scene/Mesh.js";
import { SubMesh } from "../core/render/scene/SubMesh.js";

export class SpriteFrame {
    static readonly PIXELS_PER_UNIT = 100;

    readonly mesh: Mesh;

    constructor(readonly texture: Texture) {

        const width = texture.info.width / SpriteFrame.PIXELS_PER_UNIT;
        const height = texture.info.height / SpriteFrame.PIXELS_PER_UNIT;

        const subMesh = new SubMesh(
            quad.createInputAssembler(quad.createVertexBuffer(width, height)),
            {
                count: 6,
                first: 0
            }
        )
        this.mesh = new Mesh([subMesh], vec3.create(-width / 2, -height / 2), vec3.create(width / 2, height / 2));
    }
}