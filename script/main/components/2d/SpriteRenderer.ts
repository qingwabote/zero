import { BufferUsageFlagBits } from "../../core/gfx/Buffer.js";
import Format from "../../core/gfx/Format.js";
import { IndexType } from "../../core/gfx/InputAssembler.js";
import { CullMode } from "../../core/gfx/Pipeline.js";
import { Filter } from "../../core/gfx/Sampler.js";
import Texture from "../../core/gfx/Texture.js";
import aabb2d, { AABB2D } from "../../core/math/aabb2d.js";
import vec2 from "../../core/math/vec2.js";
import vec3 from "../../core/math/vec3.js";
import vec4 from "../../core/math/vec4.js";
import samplers from "../../core/samplers.js";
import BufferViewWritable from "../../core/scene/buffers/BufferViewWritable.js";
import Model from "../../core/scene/Model.js";
import Pass from "../../core/scene/Pass.js";
import SubMesh, { IndexInputView, VertexAttribute, VertexInputView } from "../../core/scene/SubMesh.js";
import SubModel from "../../core/scene/SubModel.js";
import ShaderLib from "../../core/ShaderLib.js";
import BoundedRenderer, { BoundsEvent } from "../internal/BoundedRenderer.js";

ShaderLib.preloaded.push({ name: 'unlit', macros: { USE_ALBEDO_MAP: 1 } });

export default class SpriteRenderer extends BoundedRenderer {
    private _model: Model | undefined;
    get model(): Model | undefined {
        return this._model;
    }

    private _bounds = aabb2d.create();
    public get bounds(): Readonly<AABB2D> {
        return this._bounds;
    }

    private _texture!: Texture;
    public get texture(): Texture {
        return this._texture;
    }
    public set texture(value: Texture) {
        const { width, height } = value.info;
        const w = width / BoundedRenderer.PIXELS_PER_UNIT;
        const h = height / BoundedRenderer.PIXELS_PER_UNIT;
        aabb2d.set(this._bounds, vec2.ZERO, [w / 2, h / 2]);
        this.emit(BoundsEvent.BOUNDS_CHANGED);

        this._texture = value;
    }

    override start(): void {
        const texCoordBuffer = new BufferViewWritable("Float32", BufferUsageFlagBits.VERTEX, 8);
        const positionBuffer = new BufferViewWritable("Float32", BufferUsageFlagBits.VERTEX, 12);

        const uv_l = 0;
        const uv_r = 1;
        const uv_t = 0;
        const uv_b = 1;

        const halfExtent = this.bounds.halfExtent;
        const pos_l = -halfExtent[0];
        const pos_r = halfExtent[0];
        const pos_t = halfExtent[1];
        const pos_b = -halfExtent[1];

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
            vertexPositionMin: vec3.create(),
            vertexPositionMax: vec3.create(),
            indexInput,
            vertexOrIndexCount: indexBuffer.length
        }

        const pass = new Pass({ shader: ShaderLib.instance.getShader('unlit', { USE_ALBEDO_MAP: 1 }), rasterizationState: { cullMode: CullMode.NONE } });
        pass.setUniform('Constants', 'albedo', vec4.ONE)
        pass.setTexture('albedoMap', this.texture, samplers.get({ magFilter: Filter.NEAREST, minFilter: Filter.NEAREST }))
        const subModel: SubModel = new SubModel(subMesh, [pass]);
        const model = new Model(this.node, [subModel]);
        zero.scene.addModel(model)
        this._model = model;
    }
}