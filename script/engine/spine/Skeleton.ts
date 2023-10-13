import * as sc from '@esotericsoftware/spine-core';
import { BufferUsageFlagBits, Format, FormatInfos, IndexType, VertexAttribute, VertexAttributeVector } from 'gfx';
import { BoundedRenderer } from "../components/internal/BoundedRenderer.js";
import { Zero } from '../core/Zero.js';
import { AABB2D, aabb2d } from "../core/math/aabb2d.js";
import { vec2 } from "../core/math/vec2.js";
import { IndexInputView, VertexInputView } from '../core/render/scene/SubMesh.js';
import { SubModel } from '../core/render/scene/SubModel.js';
import { BufferViewWritable } from '../core/render/scene/buffers/BufferViewWritable.js';
import { Texture } from './Texture.js';
import { SubModelPools } from './internal/SubModelPools.js';

const vertexAttributes = new VertexAttributeVector;
let _vertexElements = 0;

const a_position = new VertexAttribute;
a_position.name = 'a_position';
a_position.format = Format.RG32_SFLOAT;
vertexAttributes.add(a_position);
_vertexElements += FormatInfos[a_position.format].nums;

const a_texCoord = new VertexAttribute;
a_texCoord.name = 'a_texCoord';
a_texCoord.format = Format.RG32_SFLOAT;
a_texCoord.offset = FormatInfos[a_position.format].bytes;
vertexAttributes.add(a_texCoord);
_vertexElements += FormatInfos[a_texCoord.format].nums;

const VERTEX_ELEMENTS = _vertexElements;

const clipper = new sc.SkeletonClipping;

const attachment_positions: number[] = [];

const sc_vec2_a = new sc.Vector2;
const sc_vec2_b = new sc.Vector2;

const sc_color_a = new sc.Color;

const vec2_a = vec2.create();
const vec2_b = vec2.create();

export class Skeleton extends BoundedRenderer {
    static readonly PIXELS_PER_UNIT = 1;

    private _bounds = aabb2d.create();
    get bounds(): Readonly<AABB2D> {
        return this._bounds;
    }

    protected _skeleton!: sc.Skeleton;
    public get data(): sc.SkeletonData {
        return this._skeleton.data;
    }
    public set data(value: sc.SkeletonData) {
        const skeleton = new sc.Skeleton(value);
        skeleton.updateWorldTransform();
        skeleton.getBounds(sc_vec2_a, sc_vec2_b);
        vec2.set(vec2_a, sc_vec2_a.x, sc_vec2_a.y);
        vec2.set(vec2_b, sc_vec2_b.x, sc_vec2_b.y);
        aabb2d.fromRect(this._bounds, vec2_a, vec2_b);
        this._skeleton = skeleton;
    }

    private _vertexInput!: VertexInputView;
    private _indexInput!: IndexInputView;

    private _pools!: SubModelPools;

    override start(): void {
        this._vertexInput = {
            buffers: [new BufferViewWritable('Float32', BufferUsageFlagBits.VERTEX, VERTEX_ELEMENTS * 2048)],
            offsets: [0]
        }
        this._indexInput = {
            buffer: new BufferViewWritable('Uint16', BufferUsageFlagBits.INDEX, 2048 * 3),
            type: IndexType.UINT16
        }
        this._pools = new SubModelPools(vertexAttributes, this._vertexInput, this._indexInput);
        Zero.instance.scene.addModel(this._model)
    }

    override lateUpdate(): void {
        this._model.subModels.length = 0;
        this._pools.recycle();

        let subModel!: SubModel;
        let key = '';
        let vertex = 0;
        let index = 0;

        const vertexBuffer = this._vertexInput.buffers[0] as BufferViewWritable;
        vertexBuffer.invalidate();
        const indexBuffer = this._indexInput.buffer as BufferViewWritable;
        indexBuffer.invalidate();

        this._skeleton.updateWorldTransform();

        for (const slot of this._skeleton.drawOrder) {
            const attachment = slot.getAttachment();
            if (!slot.bone.active) {
                clipper.clipEndWithSlot(slot);
                continue;
            }

            let attachment_vertex = 0;
            let attachment_uvs!: sc.NumberArrayLike;
            let attachment_triangles!: number[];
            let attachment_texture: Texture | undefined;
            if (attachment instanceof sc.RegionAttachment) {
                attachment.computeWorldVertices(slot, attachment_positions, 0, 2);

                attachment_vertex = 4;
                attachment_uvs = attachment.uvs;
                attachment_triangles = [0, 1, 2, 2, 3, 0];
                attachment_texture = attachment.region!.texture;
            } else if (attachment instanceof sc.MeshAttachment) {
                attachment.computeWorldVertices(slot, 0, attachment.worldVerticesLength, attachment_positions, 0, 2);

                attachment_vertex = attachment.worldVerticesLength >> 1;
                attachment_uvs = attachment.uvs;
                attachment_triangles = attachment.triangles;
                attachment_texture = attachment.region!.texture;
            } else if (attachment instanceof sc.ClippingAttachment) {
                clipper.clipStart(slot, attachment);
                continue;
            } else {
                clipper.clipEndWithSlot(slot);
                continue;
            }

            if (attachment_texture) {
                if (clipper.isClipping()) {
                    clipper.clipTriangles(attachment_positions, attachment_vertex * 2, attachment_triangles, attachment_triangles.length, attachment_uvs, sc_color_a, sc_color_a, false);

                    attachment_vertex = clipper.clippedVertices.length >> 3;
                    for (let i = 0; i < attachment_vertex; i++) {
                        const j = VERTEX_ELEMENTS * (vertex + i);
                        const k = 8 * i;

                        vertexBuffer.source[j] = clipper.clippedVertices[k];
                        vertexBuffer.source[j + 1] = clipper.clippedVertices[k + 1];

                        vertexBuffer.source[j + 2] = clipper.clippedVertices[k + 6];
                        vertexBuffer.source[j + 3] = clipper.clippedVertices[k + 7];
                    }

                    attachment_triangles = clipper.clippedTriangles;
                } else {
                    for (let i = 0; i < attachment_vertex; i++) {
                        const j = VERTEX_ELEMENTS * (vertex + i)
                        const k = 2 * i;

                        vertexBuffer.source[j] = attachment_positions[k];
                        vertexBuffer.source[j + 1] = attachment_positions[k + 1];

                        vertexBuffer.source[j + 2] = attachment_uvs[k];
                        vertexBuffer.source[j + 3] = attachment_uvs[k + 1];
                    }
                }

                for (let i = 0; i < attachment_triangles.length; i++) {
                    indexBuffer.source[index + i] = attachment_triangles[i] + vertex;
                }

                // const blend = slot.data.blendMode;
                const blend = sc.BlendMode.Normal;
                const k = `${attachment_texture.id}:${blend}`;
                if (key != k) {
                    subModel = this._pools.get(k, attachment_texture, blend);
                    subModel.drawInfo.count = 0;
                    subModel.drawInfo.first = index;
                    this._model.subModels.push(subModel);
                    key = k;
                }

                vertex += attachment_vertex;
                index += attachment_triangles.length;
                subModel.drawInfo.count += attachment_triangles.length;
            }

            clipper.clipEndWithSlot(slot);
        }

        clipper.clipEnd();

        vertexBuffer.update();
        indexBuffer.update();
    }
}