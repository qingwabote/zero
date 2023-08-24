import * as sc from '@esotericsoftware/spine-core';
import { BufferUsageFlagBits, CullMode, Format, FormatInfos, IndexType, PrimitiveTopology, impl } from 'gfx-main';
import { BoundedRenderer } from "../components/internal/BoundedRenderer.js";
import { Node } from '../core/Node.js';
import { Zero } from '../core/Zero.js';
import { AABB2D } from "../core/math/aabb2d.js";
import { vec3 } from '../core/math/vec3.js';
import { vec4 } from '../core/math/vec4.js';
import { Pass } from '../core/render/scene/Pass.js';
import { IndexInputView, SubMesh, VertexInputView } from '../core/render/scene/SubMesh.js';
import { SubModel } from '../core/render/scene/SubModel.js';
import { BufferViewWritable } from '../core/render/scene/buffers/BufferViewWritable.js';
import { shaderLib } from '../core/shaderLib.js';
import { Texture } from './Texture.js';

const vertexAttributes = new impl.VertexAttributeVector;
let _vertexElements = 0;

const a_position = new impl.VertexAttribute;
a_position.name = 'a_position';
a_position.format = Format.RG32_SFLOAT;
vertexAttributes.add(a_position);
_vertexElements += FormatInfos[a_position.format].nums;

const a_texCoord = new impl.VertexAttribute;
a_texCoord.name = 'a_texCoord';
a_texCoord.format = Format.RG32_SFLOAT;
a_texCoord.offset = FormatInfos[a_position.format].bytes;
vertexAttributes.add(a_texCoord);
_vertexElements += FormatInfos[a_texCoord.format].nums;

const VERTEX_ELEMENTS = _vertexElements;

const shader_spine = await shaderLib.load('spine', { USE_ALBEDO_MAP: 1 });

class Pool {
    private _free = 0;
    private readonly _subModels: SubModel[] = [];

    constructor(
        private readonly _vertexInput: VertexInputView,
        private readonly _indexInput: IndexInputView,
        private readonly _texture: Texture,
        private readonly _blend: sc.BlendMode) { }

    get() {
        if (this._free) {
            return this._subModels[--this._free]
        }

        const subMesh = new SubMesh(
            vertexAttributes,
            this._vertexInput,
            vec3.create(),
            vec3.create(),
            this._indexInput,
        )
        const rasterizationState = new impl.RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const state = new impl.PassState();
        state.shader = shader_spine;
        state.primitive = PrimitiveTopology.TRIANGLE_LIST;
        state.rasterizationState = rasterizationState;
        const pass = new Pass(state);
        pass.setUniform('Constants', 'albedo', vec4.ONE);
        pass.setTexture('albedoMap', this._texture.getImpl());

        const subModel = new SubModel(subMesh, [pass]);
        this._subModels.push(subModel);

        return subModel;
    }

    recycle() {
        this._free = this._subModels.length
    }
}

export class SkeletonRenderer extends BoundedRenderer {
    private _skeleton!: sc.Skeleton;
    public get skeletonData(): sc.SkeletonData {
        return this._skeleton.data;
    }
    public set skeletonData(value: sc.SkeletonData) {
        this._skeleton = new sc.Skeleton(value);
    }

    private _vertexInput!: VertexInputView;
    private _indexInput!: IndexInputView;

    private _pools: Record<string, Pool> = {};

    get bounds(): Readonly<AABB2D> {
        throw new Error("Method not implemented.");
    }

    constructor(node: Node) {
        super(node);
    }

    override start(): void {
        this._vertexInput = {
            buffers: [new BufferViewWritable('Float32', BufferUsageFlagBits.VERTEX, VERTEX_ELEMENTS * 1024)],
            offsets: [0]
        }
        this._indexInput = {
            buffer: new BufferViewWritable('Uint16', BufferUsageFlagBits.INDEX, 1024 * 3),
            type: IndexType.UINT16
        }
        Zero.instance.scene.addModel(this._model)
    }

    override lateUpdate(): void {
        this._model.subModels.length = 0;
        this.pools_recycle();

        let subModel!: SubModel;
        let key = '';
        const vertexBuffer = this._vertexInput.buffers[0] as BufferViewWritable;
        const indexBuffer = this._indexInput.buffer as BufferViewWritable;
        let vertexCount = 0;
        let indexCount = 0;

        this._skeleton.updateWorldTransform();

        for (const slot of this._skeleton.drawOrder) {
            const attachment = slot.getAttachment();
            if (attachment instanceof sc.RegionAttachment) {
                const texture: Texture = attachment.region!.texture;
                // const blend = slot.data.blendMode;
                const blend = 0;
                const k = `${texture.id}:${blend}`;
                if (key != k) {
                    subModel = this.pools_get(k, texture, blend);
                    subModel.drawInfo.count = 0;
                    subModel.drawInfo.first = indexCount;
                    this._model.subModels.push(subModel);
                    key = k;
                }
                const vertexBuffer_offset = VERTEX_ELEMENTS * vertexCount;
                attachment.computeWorldVertices(slot, vertexBuffer.data, vertexBuffer_offset, VERTEX_ELEMENTS);
                const uv_p = vertexBuffer_offset + FormatInfos[a_position.format].nums;
                for (let i = 0; i < 4; i++) {
                    const j = VERTEX_ELEMENTS * i + uv_p;
                    const k = 2 * i;
                    vertexBuffer.data[j] = attachment.uvs[k];
                    vertexBuffer.data[j + 1] = attachment.uvs[k + 1];
                }
                indexBuffer.set([vertexCount, vertexCount + 1, vertexCount + 2, vertexCount + 2, vertexCount + 3, vertexCount], indexCount);
                vertexCount += 4;
                indexCount += 6;
                subModel.drawInfo.count += 6;

            }
        }

        vertexBuffer.update();
        indexBuffer.update();
    }

    private pools_get(key: string, texture: Texture, blend: sc.BlendMode): SubModel {
        let pool = this._pools[key];
        if (!pool) {
            pool = new Pool(this._vertexInput, this._indexInput, texture, blend);
            this._pools[key] = pool;
        }
        return pool.get();
    }

    private pools_recycle() {
        for (const key in this._pools) {
            this._pools[key].recycle()
        }
    }
}