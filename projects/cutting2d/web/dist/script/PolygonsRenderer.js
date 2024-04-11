import { MeshRenderer, Node, Shader, bundle, device, render, shaderLib, vec3, vec4 } from "engine";
import { Element } from "flex";
import { BufferUsageFlagBits, CullMode, Format, FormatInfos, IndexInput, IndexType, InputAssemblerInfo, PassState, PrimitiveTopology, RasterizationState, VertexAttribute, VertexAttributeVector, VertexInput } from "gfx";
const ss_unlit = await bundle.cache('./shaders/unlit', Shader);
const vertexAttributes = new VertexAttributeVector;
const a_position = new VertexAttribute;
a_position.name = 'a_position';
a_position.format = Format.RG32_SFLOAT;
vertexAttributes.add(a_position);
const a_texCoord = new VertexAttribute;
a_texCoord.name = 'a_texCoord';
a_texCoord.format = Format.RG32_SFLOAT;
a_texCoord.offset = FormatInfos[a_position.format].bytes;
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
        const rasterizationState = new RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const state = new PassState();
        state.shader = shaderLib.getShader(ss_unlit, { USE_ALBEDO_MAP: 1 });
        state.primitive = PrimitiveTopology.TRIANGLE_LIST;
        state.rasterizationState = rasterizationState;
        const pass = render.Pass.Pass(state);
        pass.setUniform('Props', 'albedo', vec4.ONE);
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
                vertexBuffer.update();
                vec3.set(vec3_a, ...polygon.vertexPosMin, 0);
                vec3.set(vec3_b, ...polygon.vertexPosMax, 0);
                renderer.mesh.setBoundsByPoints(vec3_a, vec3_b);
                const indexBuffer = this._indexViews[i];
                triangulate(polygon.vertexes.length, indexBuffer);
                indexBuffer.invalidate();
                indexBuffer.update();
                subMesh.drawInfo.count = indexBuffer.length;
                renderer.node.position = vec3.create(...polygon.translation, 0);
            }
            for (; i < this._meshRenderers.length; i++) {
                const renderer = this._meshRenderers[i];
                const subMesh = renderer.mesh.subMeshes[0];
                subMesh.drawInfo.count = 0;
            }
            this._polygons_invalidated = false;
        }
    }
    cacheMeshRenderer(index) {
        let renderer = this._meshRenderers[index];
        if (!renderer) {
            const iaInfo = new InputAssemblerInfo;
            iaInfo.vertexAttributes = vertexAttributes;
            const vertexView = new render.BufferView('Float32', BufferUsageFlagBits.VERTEX);
            const vertexInput = new VertexInput;
            vertexInput.buffers.add(vertexView.buffer);
            vertexInput.offsets.add(0);
            iaInfo.vertexInput = vertexInput;
            const indexView = new render.BufferView('Uint16', BufferUsageFlagBits.INDEX);
            const indexInput = new IndexInput;
            indexInput.buffer = indexView.buffer;
            indexInput.type = IndexType.UINT16;
            iaInfo.indexInput = indexInput;
            const subMesh = new render.SubMesh(device.createInputAssembler(iaInfo));
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
