import * as sc from '@esotericsoftware/spine-core';
import { BoundedRenderer, BoundsEventName, Shader, Zero, bundle, device, render, shaderLib, vec2, vec3, vec4 } from "engine";
import { BlendFactor, BlendState, BufferUsageFlagBits, CullMode, Format, FormatInfos, IndexInput, IndexType, InputAssemblerInfo, PassState, PrimitiveTopology, RasterizationState, VertexAttribute, VertexAttributeVector, VertexInput } from 'gfx';
const [VERTEX_ATTRIBUTES, VERTEX_ELEMENTS] = (function () {
    const attributes = new VertexAttributeVector;
    let elements = 0;
    const a_position = new VertexAttribute;
    a_position.name = 'a_position';
    a_position.format = Format.RG32_SFLOAT;
    attributes.add(a_position);
    elements += FormatInfos[a_position.format].nums;
    const a_texCoord = new VertexAttribute;
    a_texCoord.name = 'a_texCoord';
    a_texCoord.format = Format.RG32_SFLOAT;
    a_texCoord.offset = FormatInfos[a_position.format].bytes;
    attributes.add(a_texCoord);
    elements += FormatInfos[a_texCoord.format].nums;
    return [attributes, elements];
})();
const ss_spine = await bundle.cache('./shaders/unlit', Shader);
const clipper = new sc.SkeletonClipping;
const attachment_positions = [];
const sc_vec2_a = new sc.Vector2;
const sc_vec2_b = new sc.Vector2;
const sc_color_a = new sc.Color;
const vec3_a = vec3.create();
const vec3_b = vec3.create();
export class Skeleton extends BoundedRenderer {
    get data() {
        return this._skeleton.data;
    }
    set data(value) {
        const skeleton = new sc.Skeleton(value);
        skeleton.updateWorldTransform();
        skeleton.getBounds(sc_vec2_a, sc_vec2_b);
        vec2.set(vec3_a, sc_vec2_a.x, sc_vec2_a.y);
        vec2.set(vec3_b, sc_vec2_b.x, sc_vec2_b.y);
        this._mesh.setBoundsByRect(vec3_a, vec3_b);
        this._skeleton = skeleton;
        this.emit(BoundsEventName.BOUNDS_CHANGED);
    }
    constructor(node) {
        super(node);
        this._vertexView = new render.BufferView("Float32", BufferUsageFlagBits.VERTEX, VERTEX_ELEMENTS * 2048);
        this._indexView = new render.BufferView("Uint16", BufferUsageFlagBits.INDEX, 2048 * 3);
        this._materials = {};
        const iaInfo = new InputAssemblerInfo;
        iaInfo.vertexAttributes = VERTEX_ATTRIBUTES;
        const vertexInput = new VertexInput;
        vertexInput.buffers.add(this._vertexView.buffer);
        vertexInput.offsets.add(0);
        iaInfo.vertexInput = vertexInput;
        const indexInput = new IndexInput;
        indexInput.buffer = this._indexView.buffer;
        indexInput.type = IndexType.UINT16;
        iaInfo.indexInput = indexInput;
        const mesh = new render.Mesh([new render.SubMesh(device.createInputAssembler(iaInfo))]);
        this._model.mesh = mesh;
        this._mesh = mesh;
    }
    start() {
        Zero.instance.scene.addModel(this._model);
    }
    lateUpdate() {
        const materials = [];
        let key = '';
        let vertex = 0;
        let index = 0;
        this._vertexView.invalidate();
        this._indexView.invalidate();
        this._skeleton.updateWorldTransform();
        for (const slot of this._skeleton.drawOrder) {
            const attachment = slot.getAttachment();
            if (!slot.bone.active) {
                clipper.clipEndWithSlot(slot);
                continue;
            }
            let attachment_vertex = 0;
            let attachment_uvs;
            let attachment_triangles;
            let attachment_texture;
            if (attachment instanceof sc.RegionAttachment) {
                attachment.computeWorldVertices(slot, attachment_positions, 0, 2);
                attachment_vertex = 4;
                attachment_uvs = attachment.uvs;
                attachment_triangles = [0, 1, 2, 2, 3, 0];
                attachment_texture = attachment.region.texture;
            }
            else if (attachment instanceof sc.MeshAttachment) {
                attachment.computeWorldVertices(slot, 0, attachment.worldVerticesLength, attachment_positions, 0, 2);
                attachment_vertex = attachment.worldVerticesLength >> 1;
                attachment_uvs = attachment.uvs;
                attachment_triangles = attachment.triangles;
                attachment_texture = attachment.region.texture;
            }
            else if (attachment instanceof sc.ClippingAttachment) {
                clipper.clipStart(slot, attachment);
                continue;
            }
            else {
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
                }
                else {
                    for (let i = 0; i < attachment_vertex; i++) {
                        const j = VERTEX_ELEMENTS * (vertex + i);
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
                    let material = this._materials[k];
                    if (!material) {
                        material = this.createMaterial(blend, attachment_texture);
                        this._materials[k] = material;
                    }
                    materials.push(material);
                    const drawInfo = this._mesh.subMeshes[0].drawInfo;
                    drawInfo.count = 0;
                    drawInfo.first = index;
                    key = k;
                }
                vertex += attachment_vertex;
                index += attachment_triangles.length;
                this._mesh.subMeshes[0].drawInfo.count += attachment_triangles.length;
            }
            clipper.clipEndWithSlot(slot);
        }
        clipper.clipEnd();
        this._vertexView.update();
        this._indexView.update();
        this._model.materials = materials;
    }
    createMaterial(blend, texture) {
        const rasterizationState = new RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const state = new PassState();
        state.shader = shaderLib.getShader(ss_spine, { USE_ALBEDO_MAP: 1 });
        state.primitive = PrimitiveTopology.TRIANGLE_LIST;
        state.rasterizationState = rasterizationState;
        switch (blend) {
            case sc.BlendMode.Normal:
                const blendState = new BlendState;
                blendState.srcRGB = BlendFactor.ONE; // premultipliedAlpha
                blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
                blendState.srcAlpha = BlendFactor.ONE;
                blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA;
                state.blendState = blendState;
                break;
            default:
                break;
        }
        const pass = new render.Pass(state);
        pass.initialize();
        pass.setUniform('Props', 'albedo', vec4.ONE);
        pass.setTexture('albedoMap', texture.getImpl());
        return new render.Material([pass]);
    }
}
Skeleton.PIXELS_PER_UNIT = 1;
