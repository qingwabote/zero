import { BufferUsageFlagBits, Format, IndexType, Texture, VertexAttribute, VertexAttributeVector } from "gfx";
import { vec3 } from "../core/math/vec3.js";
import { IndexInputView, SubMesh, VertexInputView } from "../core/render/scene/SubMesh.js";
import { BufferViewWritable } from "../core/render/scene/buffers/BufferViewWritable.js";
import { Mesh } from "./Mesh.js";

export class SpriteFrame {
    static readonly PIXELS_PER_UNIT = 100;

    readonly mesh: Mesh;

    constructor(readonly texture: Texture) {
        const texCoordBuffer = new BufferViewWritable("Float32", BufferUsageFlagBits.VERTEX, 8);
        const positionBuffer = new BufferViewWritable("Float32", BufferUsageFlagBits.VERTEX, 12);

        const uv_l = 0;
        const uv_r = 1;
        const uv_t = 0;
        const uv_b = 1;

        let { width, height } = texture.info;
        [width, height] = [width / SpriteFrame.PIXELS_PER_UNIT, height / SpriteFrame.PIXELS_PER_UNIT];
        const pos_l = -width / 2;
        const pos_r = width / 2;
        const pos_t = height / 2;
        const pos_b = -height / 2;

        texCoordBuffer.source[0] = uv_l;
        texCoordBuffer.source[1] = uv_t;
        positionBuffer.source[0] = pos_l;
        positionBuffer.source[1] = pos_t;
        positionBuffer.source[2] = 0;

        texCoordBuffer.source[2] = uv_l;
        texCoordBuffer.source[3] = uv_b;
        positionBuffer.source[3] = pos_l;
        positionBuffer.source[4] = pos_b;
        positionBuffer.source[5] = 0;

        texCoordBuffer.source[4] = uv_r;
        texCoordBuffer.source[5] = uv_b;
        positionBuffer.source[6] = pos_r;
        positionBuffer.source[7] = pos_b;
        positionBuffer.source[8] = 0;

        texCoordBuffer.source[6] = uv_r;
        texCoordBuffer.source[7] = uv_t;
        positionBuffer.source[9] = pos_r;
        positionBuffer.source[10] = pos_t;
        positionBuffer.source[11] = 0;

        texCoordBuffer.invalidate();
        positionBuffer.invalidate();

        const indexBuffer = new BufferViewWritable("Uint16", BufferUsageFlagBits.INDEX, 6);
        // By default, triangles defined with counter-clockwise vertices are processed as front-facing triangles
        indexBuffer.set([0, 1, 3, 3, 1, 2]);

        texCoordBuffer.update();
        positionBuffer.update();
        indexBuffer.update();

        const vertexAttributes = new VertexAttributeVector;
        const texCoordAttribute = new VertexAttribute;
        texCoordAttribute.name = 'a_texCoord';
        texCoordAttribute.format = Format.RG32_SFLOAT;
        texCoordAttribute.buffer = 0;
        texCoordAttribute.offset = 0;
        vertexAttributes.add(texCoordAttribute);
        const positionAttribute = new VertexAttribute;
        positionAttribute.name = 'a_position';
        positionAttribute.format = Format.RGB32_SFLOAT;
        positionAttribute.buffer = 1;
        positionAttribute.offset = 0;
        vertexAttributes.add(positionAttribute);

        const vertexInput: VertexInputView = {
            buffers: [texCoordBuffer, positionBuffer],
            offsets: [0, 0]
        }
        const indexInput: IndexInputView = {
            buffer: indexBuffer,
            type: IndexType.UINT16
        }
        const subMesh = new SubMesh(
            vertexAttributes,
            vertexInput,
            vec3.create(pos_l, pos_b, 0),
            vec3.create(pos_r, pos_t, 0),
            indexInput,
            {
                count: indexBuffer.length,
                first: 0
            }
        )
        this.mesh = { subMeshes: [subMesh] };
    }
}