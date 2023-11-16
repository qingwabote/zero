import { Material, MeshRenderer, Node, ShaderStages, UIElement, Vec2, VisibilityFlagBits, bundle, render, shaderLib, vec2, vec3, vec4 } from "engine";
import { BufferUsageFlagBits, CullMode, Format, FormatInfos, IndexType, PassState, PrimitiveTopology, RasterizationState, Texture, VertexAttribute, VertexAttributeVector } from "gfx";
import { Polygon } from "./Polygon.js";

const ss_unlit = await bundle.cache('./shaders/unlit', ShaderStages);

const vertexAttributes = new VertexAttributeVector;

const a_position = new VertexAttribute;
a_position.name = 'a_position';
a_position.format = Format.RGB32_SFLOAT;
vertexAttributes.add(a_position);

const a_texCoord = new VertexAttribute;
a_texCoord.name = 'a_texCoord';
a_texCoord.format = Format.RG32_SFLOAT;
a_texCoord.offset = FormatInfos[Format.RGB32_SFLOAT].bytes;
vertexAttributes.add(a_texCoord);

function triangulate(n: number, indexBuffer: render.BufferViewWritable) {
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
            for (let i = 0; i < this._polygons.length; i++) {
                const polygon = this._polygons[i];
                const renderer = this.getMeshRenderer(i);
                const subMesh = renderer.mesh.subMeshes[0];
                const vertexBuffer = subMesh.vertexInput.buffers[0] as render.BufferViewWritable;
                vertexBuffer.reset(5 * polygon.vertexes.length);
                let offset = 0;
                for (let i = 0; i < polygon.vertexes.length; i++) {
                    const vertex = polygon.vertexes[i];
                    vertexBuffer.source[offset++] = vertex.pos[0]
                    vertexBuffer.source[offset++] = vertex.pos[1]
                    vertexBuffer.source[offset++] = 0
                    vertexBuffer.set(vertex.uv, offset);
                    offset += 2
                }
                vertexBuffer.invalidate();
                vertexBuffer.update();
                vec3.set(subMesh.vertexPositionMin, ...polygon.vertexPosMin, 0);
                vec3.set(subMesh.vertexPositionMax, ...polygon.vertexPosMax, 0);

                const indexBuffer = subMesh.indexInput?.buffer as render.BufferViewWritable;
                triangulate(polygon.vertexes.length, indexBuffer);
                indexBuffer.invalidate();
                indexBuffer.update();

                subMesh.drawInfo.count = indexBuffer.length;

                renderer.node.position = vec3.create(...polygon.translation, 0)
            }
            this._polygons_invalidated = false;
        }
    }

    getMeshRenderer(index: number): MeshRenderer {
        let renderer = this._meshRenderers[index];
        if (!renderer) {
            const subMesh = new render.SubMesh(
                vertexAttributes,
                {
                    buffers: [new render.BufferViewWritable('Float32', BufferUsageFlagBits.VERTEX)],
                    offsets: [0]
                },
                vec3.create(), vec3.create(),
                {
                    buffer: new render.BufferViewWritable('Uint16', BufferUsageFlagBits.INDEX),
                    type: IndexType.UINT16
                }
            )
            renderer = (new Node(`PolygonsRenderer${index}`)).addComponent(MeshRenderer)
            renderer.mesh = { subMeshes: [subMesh] }
            renderer.materials = [this._material];
            this.node.addChild(renderer.node)
            this._meshRenderers[index] = renderer;
        }
        return renderer;
    }
}