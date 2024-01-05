import { Material, MeshRenderer, Node, Shader, UIElement, Vec2, bundle, device, render, shaderLib, vec2, vec3, vec4 } from "engine";
import { BufferUsageFlagBits, CullMode, Format, FormatInfos, IndexInput, IndexType, InputAssemblerInfo, PassState, PrimitiveTopology, RasterizationState, Texture, VertexAttribute, VertexAttributeVector, VertexInput } from "gfx";
import { Polygon } from "./Polygon.js";

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

function triangulate(n: number, indexBuffer: render.BufferView) {
    const triangles = n - 2;
    indexBuffer.reset(3 * triangles);
    for (let i = 0; i < triangles; i++) {
        indexBuffer.source[i * 3] = 0;
        indexBuffer.source[i * 3 + 1] = i + 1;
        indexBuffer.source[i * 3 + 2] = i + 2;
    }
}

export default class PolygonsRenderer extends UIElement {
    public get size(): Readonly<Vec2> {
        return vec2.ZERO
    }
    public set size(value: Readonly<Vec2>) { }

    public get anchor(): Readonly<Vec2> {
        return vec2.ZERO
    }
    public set anchor(value: Readonly<Vec2>) { }

    private _polygons_invalidated = true;
    private _polygons: readonly Polygon[] = [];
    public get polygons(): readonly Polygon[] {
        return this._polygons;
    }
    public set polygons(value: readonly Polygon[]) {
        this._polygons = value;
        this._polygons_invalidated = true;
    }

    texture!: Texture;

    private _material!: Material;

    private _meshRenderers: MeshRenderer[] = [];
    private _vertexViews: render.BufferView[] = [];
    private _indexViews: render.BufferView[] = [];

    override start(): void {
        const rasterizationState = new RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const state = new PassState();
        state.shader = shaderLib.getShader(ss_unlit, { USE_ALBEDO_MAP: 1 });
        state.primitive = PrimitiveTopology.TRIANGLE_LIST;
        state.rasterizationState = rasterizationState;
        const pass = new render.Pass(state);
        pass.setUniform('Constants', 'albedo', vec4.ONE);
        pass.setTexture('albedoMap', this.texture);
        this._material = { passes: [pass] };
    }

    override update(): void {
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
                    vertexBuffer.source[offset++] = vertex.pos[0]
                    vertexBuffer.source[offset++] = vertex.pos[1]
                    vertexBuffer.set(vertex.uv, offset);
                    offset += 2
                }
                vertexBuffer.invalidate();
                vertexBuffer.update();
                vec3.set(subMesh.vertexPositionMin, ...polygon.vertexPosMin, 0);
                vec3.set(subMesh.vertexPositionMax, ...polygon.vertexPosMax, 0);

                const indexBuffer = this._indexViews[i];
                triangulate(polygon.vertexes.length, indexBuffer);
                indexBuffer.invalidate();
                indexBuffer.update();

                subMesh.drawInfo.count = indexBuffer.length;

                renderer.node.position = vec3.create(...polygon.translation, 0)
            }
            for (; i < this._meshRenderers.length; i++) {
                const renderer = this._meshRenderers[i];
                const subMesh = renderer.mesh.subMeshes[0];
                subMesh.drawInfo.count = 0;
            }
            this._polygons_invalidated = false;
        }
    }

    cacheMeshRenderer(index: number): MeshRenderer {
        let renderer = this._meshRenderers[index];
        if (!renderer) {
            const iaInfo = new InputAssemblerInfo;
            iaInfo.vertexAttributes = vertexAttributes;

            const vertexView = new render.BufferView('Float32', BufferUsageFlagBits.VERTEX)
            const vertexInput = new VertexInput;
            vertexInput.buffers.add(vertexView.buffer);
            vertexInput.offsets.add(0);
            iaInfo.vertexInput = vertexInput;

            const indexView = new render.BufferView('Uint16', BufferUsageFlagBits.INDEX);
            const indexInput = new IndexInput;
            indexInput.buffer = indexView.buffer;
            indexInput.type = IndexType.UINT16;
            iaInfo.indexInput = indexInput;

            const subMesh = new render.SubMesh(
                device.createInputAssembler(iaInfo),
                vec3.create(), vec3.create()
            )
            renderer = (new Node(`PolygonsRenderer${index}`)).addComponent(MeshRenderer)
            renderer.mesh = { subMeshes: [subMesh] }
            renderer.materials = [this._material];
            this.node.addChild(renderer.node)
            this._meshRenderers[index] = renderer;
            this._vertexViews[index] = vertexView;
            this._indexViews[index] = indexView;
        }
        return renderer;
    }
}