import { MeshRenderer, Node, Shader, bundle, render, scene, shaderLib, vec3, vec4 } from "engine";
import { Element } from "flex";
import { BufferUsageFlagBits, Format, FormatInfos, IndexInput, IndexType, InputAssembler, PrimitiveTopology, VertexAttribute, VertexAttributeVector, VertexInput } from "gfx";
const ss_unlit = await bundle.cache('./shaders/unlit', Shader);
const vertexAttributes = new VertexAttributeVector;
const a_position = new VertexAttribute;
a_position.format = Format.RG32_SFLOAT;
a_position.location = shaderLib.attributes.position.location;
vertexAttributes.add(a_position);
const a_texCoord = new VertexAttribute;
a_texCoord.format = Format.RG32_SFLOAT;
a_texCoord.offset = FormatInfos[a_position.format].bytes;
a_texCoord.location = shaderLib.attributes.uv.location;
vertexAttributes.add(a_texCoord);
function triangulate(n, indexBuffer) {
    const triangles = n - 2;
    indexBuffer.reset(3 * triangles);
    for (let i = 0; i < triangles; i++) {
        indexBuffer.source[i * 3] = 0;
        indexBuffer.source[i * 3 + 1] = i + 1;
        indexBuffer.source[i * 3 + 2] = i + 2;
    }
}
const vec3_a = vec3.create();
const vec3_b = vec3.create();
export default class PolygonsRenderer extends Element {
    constructor() {
        super(...arguments);
        this._polygons_invalidated = true;
        this._polygons = [];
        this._meshRenderers = [];
        this._vertexViews = [];
        this._indexViews = [];
    }
    get polygons() {
        return this._polygons;
    }
    set polygons(value) {
        this._polygons = value;
        this._polygons_invalidated = true;
    }
    start() {
        const pass = new scene.Pass({ shader: shaderLib.getShader(ss_unlit, { USE_ALBEDO_MAP: 1 }) });
        pass.setPropertyByName('albedo', vec4.ONE);
        pass.setTexture('albedoMap', this.texture);
        this._material = { passes: [pass] };
    }
    update() {
        if (this._polygons_invalidated) {
            let i = 0;
            for (; i < this._polygons.length; i++) {
                const polygon = this._polygons[i];
                const renderer = this.cacheMeshRenderer(i);
                const subMesh = renderer.mesh.subMeshes[0];
                const vertexBuffer = this._vertexViews[i];
                vertexBuffer.reset(5 * polygon.vertexes.length);
                let offset = 0;
                for (let i = 0; i < polygon.vertexes.length; i++) {
                    const vertex = polygon.vertexes[i];
                    vertexBuffer.source[offset++] = vertex.pos[0];
                    vertexBuffer.source[offset++] = vertex.pos[1];
                    vertexBuffer.set(vertex.uv, offset);
                    offset += 2;
                }
                vertexBuffer.invalidate();
                vec3.set(vec3_a, ...polygon.vertexPosMin, 0);
                vec3.set(vec3_b, ...polygon.vertexPosMax, 0);
                renderer.mesh.setBoundsByExtremes(vec3_a, vec3_b);
                const indexBuffer = this._indexViews[i];
                triangulate(polygon.vertexes.length, indexBuffer);
                indexBuffer.invalidate();
                subMesh.draw.count = indexBuffer.length;
                renderer.node.position = vec3.create(...polygon.translation, 0);
            }
            for (; i < this._meshRenderers.length; i++) {
                const renderer = this._meshRenderers[i];
                const subMesh = renderer.mesh.subMeshes[0];
                subMesh.draw.count = 0;
            }
            this._polygons_invalidated = false;
        }
    }
    upload(commandBuffer) {
        for (const vertexView of this._vertexViews) {
            vertexView.update(commandBuffer);
        }
        for (const indexView of this._indexViews) {
            indexView.update(commandBuffer);
        }
    }
    cacheMeshRenderer(index) {
        let renderer = this._meshRenderers[index];
        if (!renderer) {
            const ia = new InputAssembler;
            ia.vertexInputState.attributes = vertexAttributes;
            ia.vertexInputState.primitive = PrimitiveTopology.TRIANGLE_LIST;
            const vertexView = new render.BufferView('Float32', BufferUsageFlagBits.VERTEX);
            const vertexInput = new VertexInput;
            vertexInput.buffers.add(vertexView.buffer);
            vertexInput.offsets.add(0);
            ia.vertexInput = vertexInput;
            const indexView = new render.BufferView('Uint16', BufferUsageFlagBits.INDEX);
            const indexInput = new IndexInput;
            indexInput.buffer = indexView.buffer;
            indexInput.type = IndexType.UINT16;
            ia.indexInput = indexInput;
            const subMesh = new render.SubMesh(ia);
            renderer = (new Node(`PolygonsRenderer${index}`)).addComponent(MeshRenderer);
            renderer.mesh = new render.Mesh([subMesh]);
            renderer.materials = [this._material];
            this.node.addChild(renderer.node);
            this._meshRenderers[index] = renderer;
            this._vertexViews[index] = vertexView;
            this._indexViews[index] = indexView;
        }
        return renderer;
    }
}