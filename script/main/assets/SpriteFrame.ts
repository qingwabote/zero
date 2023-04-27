import Asset from "../core/Asset.js";
import AssetLib from "../core/AssetLib.js";
import { BufferUsageFlagBits } from "../core/gfx/Buffer.js";
import Format from "../core/gfx/Format.js";
import { IndexType } from "../core/gfx/InputAssembler.js";
import vec3 from "../core/math/vec3.js";
import SubMesh, { IndexInputView, PIXELS_PER_UNIT, VertexAttribute, VertexInputView } from "../core/scene/SubMesh.js";
import BufferViewWritable from "../core/scene/buffers/BufferViewWritable.js";
import Mesh from "./Mesh.js";
import Texture from "./Texture.js";

export default class SpriteFrame extends Asset {
    private _texture!: Texture;
    get texture(): Texture {
        return this._texture;
    }

    private _mesh!: Mesh;
    get mesh(): Mesh {
        return this._mesh;
    }

    async load(path: string): Promise<this> {
        const texture = await AssetLib.instance.load({ path, type: Texture });

        const texCoordBuffer = new BufferViewWritable("Float32", BufferUsageFlagBits.VERTEX, 8);
        const positionBuffer = new BufferViewWritable("Float32", BufferUsageFlagBits.VERTEX, 12);

        const uv_l = 0;
        const uv_r = 1;
        const uv_t = 0;
        const uv_b = 1;

        let { width, height } = texture.impl.info;
        [width, height] = [width / PIXELS_PER_UNIT, height / PIXELS_PER_UNIT];
        const pos_l = -width / 2;
        const pos_r = width / 2;
        const pos_t = height / 2;
        const pos_b = -height / 2;

        texCoordBuffer.data[0] = uv_l;
        texCoordBuffer.data[1] = uv_t;
        positionBuffer.data[0] = pos_l;
        positionBuffer.data[1] = pos_t;
        positionBuffer.data[2] = 0;

        texCoordBuffer.data[2] = uv_l;
        texCoordBuffer.data[3] = uv_b;
        positionBuffer.data[3] = pos_l;
        positionBuffer.data[4] = pos_b;
        positionBuffer.data[5] = 0;

        texCoordBuffer.data[4] = uv_r;
        texCoordBuffer.data[5] = uv_b;
        positionBuffer.data[6] = pos_r;
        positionBuffer.data[7] = pos_b;
        positionBuffer.data[8] = 0;

        texCoordBuffer.data[6] = uv_r;
        texCoordBuffer.data[7] = uv_t;
        positionBuffer.data[9] = pos_r;
        positionBuffer.data[10] = pos_t;
        positionBuffer.data[11] = 0;

        const indexBuffer = new BufferViewWritable("Uint16", BufferUsageFlagBits.INDEX, 6);
        // By default, triangles defined with counter-clockwise vertices are processed as front-facing triangles
        indexBuffer.set([0, 1, 3, 3, 1, 2]);

        texCoordBuffer.update();
        positionBuffer.update();
        indexBuffer.update();

        const vertexAttributes: VertexAttribute[] = [
            { name: 'a_texCoord', format: Format.RG32_SFLOAT, buffer: 0, offset: 0 },
            { name: 'a_position', format: Format.RGB32_SFLOAT, buffer: 1, offset: 0 },
        ];
        const vertexInput: VertexInputView = {
            buffers: [texCoordBuffer, positionBuffer],
            offsets: [0, 0]
        }
        const indexInput: IndexInputView = {
            buffer: indexBuffer,
            offset: 0,
            type: IndexType.UINT16
        }
        const subMesh: SubMesh = {
            vertexAttributes,
            vertexInput,
            vertexPositionMin: vec3.create(pos_l, pos_b, 0),
            vertexPositionMax: vec3.create(pos_r, pos_t, 0),
            indexInput,
            vertexOrIndexCount: indexBuffer.length
        }
        this._mesh = { subMeshes: [subMesh] };
        this._texture = texture;
        return this;
    }

}