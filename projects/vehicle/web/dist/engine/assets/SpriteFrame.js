import { vec3 } from "../core/math/vec3.js";
import { quad } from "../core/render/quad.js";
import { SubMesh } from "../core/render/scene/SubMesh.js";
export class SpriteFrame {
    constructor(texture) {
        this.texture = texture;
        const width = texture.info.width / SpriteFrame.PIXELS_PER_UNIT;
        const height = texture.info.height / SpriteFrame.PIXELS_PER_UNIT;
        const subMesh = new SubMesh(quad.createInputAssembler(quad.createVertexBuffer(width, height)), vec3.create(-width / 2, -height / 2), vec3.create(width / 2, height / 2), {
            count: 6,
            first: 0
        });
        this.mesh = { subMeshes: [subMesh] };
    }
}
SpriteFrame.PIXELS_PER_UNIT = 100;
