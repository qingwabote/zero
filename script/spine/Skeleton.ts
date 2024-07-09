import * as sc from '@esotericsoftware/spine-core';
import { BoundedRenderer, Node, Shader, bundle, render, scene, shaderLib, vec2, vec3, vec4 } from "engine";
import { AABB3D } from 'engine/core/math/aabb3d.js';
import { BlendFactor, BlendState, BufferUsageFlagBits, Format, FormatInfos, IndexInput, IndexType, InputAssembler, PrimitiveTopology, VertexAttribute, VertexAttributeVector } from 'gfx';
import { Texture } from './Texture.js';

const [VERTEX_ATTRIBUTES, VERTEX_ELEMENTS] = (function () {
    const attributes = new VertexAttributeVector;
    let elements = 0;

    const position = new VertexAttribute;
    position.format = Format.RG32_SFLOAT;
    position.location = shaderLib.attributes.position.location;
    attributes.add(position);
    elements += FormatInfos[position.format].nums;

    const texCoord = new VertexAttribute;
    texCoord.format = Format.RG32_SFLOAT;
    texCoord.offset = FormatInfos[position.format].bytes;
    texCoord.location = shaderLib.attributes.uv.location;
    attributes.add(texCoord);
    elements += FormatInfos[texCoord.format].nums;

    return [attributes, elements];
})()

const ss_spine = await bundle.cache('./shaders/unlit', Shader);

const clipper = new sc.SkeletonClipping;

const attachment_positions: number[] = [];

const sc_vec2_a = new sc.Vector2;
const sc_vec2_b = new sc.Vector2;

const sc_color_a = new sc.Color;

const vec3_a = vec3.create();
const vec3_b = vec3.create();

export class Skeleton extends BoundedRenderer {
    static readonly PIXELS_PER_UNIT = 1;

    private _mesh: render.Mesh;
    private _materials: scene.Material[] = [];

    public get bounds(): Readonly<AABB3D> {
        return this._mesh.bounds;
    }

    protected _skeleton!: sc.Skeleton;
    public get data(): sc.SkeletonData {
        return this._skeleton.data;
    }
    public set data(value: sc.SkeletonData) {
        const skeleton = new sc.Skeleton(value);
        skeleton.updateWorldTransform();
        skeleton.getBounds(sc_vec2_a, sc_vec2_b);
        vec2.set(vec3_a, sc_vec2_a.x, sc_vec2_a.y);
        vec2.set(vec3_b, sc_vec2_b.x, sc_vec2_b.y);
        this._mesh.setBoundsByRect(vec3_a, vec3_b)
        this._skeleton = skeleton;
        this.emit(BoundedRenderer.EventName.BOUNDS_CHANGED);
    }

    private _vertexView = new render.BufferView("Float32", BufferUsageFlagBits.VERTEX, VERTEX_ELEMENTS * 2048);
    private _indexView = new render.BufferView("Uint16", BufferUsageFlagBits.INDEX, 2048 * 3);

    private _materialCache: Record<string, scene.Material> = {};

    constructor(node: Node) {
        super(node);

        const ia = new InputAssembler;
        ia.vertexInputState.attributes = VERTEX_ATTRIBUTES;
        ia.vertexInputState.primitive = PrimitiveTopology.TRIANGLE_LIST;
        ia.vertexInput.buffers.add(this._vertexView.buffer);
        ia.vertexInput.offsets.add(0);

        const indexInput = new IndexInput;
        indexInput.buffer = this._indexView.buffer;
        indexInput.type = IndexType.UINT16;
        ia.indexInput = indexInput;

        this._mesh = new render.Mesh([new render.SubMesh(ia)]);;
    }

    protected createModel(): render.Model | null {
        return new render.Model(this.node, this._mesh, this._materials);
    }

    override upload(): void {
        let key = '';
        let vertex = 0;
        let index = 0;

        this._vertexView.invalidate();
        this._indexView.invalidate();
        this._materials.length = 0;

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

                        this._vertexView.source[j] = clipper.clippedVertices[k];
                        this._vertexView.source[j + 1] = clipper.clippedVertices[k + 1];

                        this._vertexView.source[j + 2] = clipper.clippedVertices[k + 6];
                        this._vertexView.source[j + 3] = clipper.clippedVertices[k + 7];
                    }

                    attachment_triangles = clipper.clippedTriangles;
                } else {
                    for (let i = 0; i < attachment_vertex; i++) {
                        const j = VERTEX_ELEMENTS * (vertex + i)
                        const k = 2 * i;

                        this._vertexView.source[j] = attachment_positions[k];
                        this._vertexView.source[j + 1] = attachment_positions[k + 1];

                        this._vertexView.source[j + 2] = attachment_uvs[k];
                        this._vertexView.source[j + 3] = attachment_uvs[k + 1];
                    }
                }

                for (let i = 0; i < attachment_triangles.length; i++) {
                    this._indexView.source[index + i] = attachment_triangles[i] + vertex;
                }

                // const blend = slot.data.blendMode;
                const blend = sc.BlendMode.Normal;
                const k = `${attachment_texture.id}:${blend}`;
                if (key != k) {
                    let material = this._materialCache[k];
                    if (!material) {
                        material = this.createMaterial(blend, attachment_texture);
                        this._materialCache[k] = material;
                    }
                    this._materials.push(material);

                    const draw = this._mesh.subMeshes[0].draw;
                    draw.count = 0;
                    draw.first = index;

                    key = k;
                }

                vertex += attachment_vertex;
                index += attachment_triangles.length;
                this._mesh.subMeshes[0].draw.count += attachment_triangles.length;
            }

            clipper.clipEndWithSlot(slot);
        }

        clipper.clipEnd();

        this._vertexView.update();
        this._indexView.update();
    }

    private createMaterial(blend: sc.BlendMode, texture: Texture): scene.Material {
        let blendState: BlendState | undefined = undefined
        switch (blend) {
            case sc.BlendMode.Normal:
                blendState = new BlendState;
                blendState.srcRGB = BlendFactor.ONE; // premultipliedAlpha
                blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
                blendState.srcAlpha = BlendFactor.ONE;
                blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA;
                break;

            default:
                break;
        }
        const pass = new scene.Pass({ shader: shaderLib.getShader(ss_spine, { USE_ALBEDO_MAP: 1 }), blendState })
        pass.setPropertyByName('albedo', vec4.ONE);
        pass.setTexture('albedoMap', texture.getImpl());

        return { passes: [pass] };
    }
}