import { BufferViewResizable, Material, MeshRenderer, Node, Pass, SubMesh, UIElement, Vec2, VertexAttribute, shaderLib, vec2, vec3, vec4 } from "engine-main";
import { BufferUsageFlagBits, CullMode, Format, FormatInfos, IndexType, PrimitiveTopology, Texture, impl } from "gfx-main";
import { Polygon } from "./Polygon.js";

const unlit = await shaderLib.load('unlit', { USE_ALBEDO_MAP: 1 })

const vertexAttributes: readonly VertexAttribute[] = [
    { name: 'a_position', format: Format.RGB32_SFLOAT, buffer: 0, offset: 0 },
    { name: 'a_texCoord', format: Format.RG32_SFLOAT, buffer: 0, offset: FormatInfos[Format.RGB32_SFLOAT].size },
];

function triangulate(n: number, indexBuffer: BufferViewResizable) {
    const triangles = n - 2;
    indexBuffer.reset(3 * triangles);
    for (let i = 0; i < triangles; i++) {
        indexBuffer.data[i * 3] = 0;
        indexBuffer.data[i * 3 + 1] = i + 1;
        indexBuffer.data[i * 3 + 2] = i + 2;
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
        const rasterizationState = new impl.RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const state = new impl.PassState();
        state.shader = unlit;
        state.primitive = PrimitiveTopology.TRIANGLE_LIST;
        state.rasterizationState = rasterizationState;
        const pass = new Pass(state);
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
                const vertexBuffer = subMesh.vertexInput.buffers[0] as BufferViewResizable;
                vertexBuffer.reset(5 * polygon.vertexes.length);
                let offset = 0;
                for (let i = 0; i < polygon.vertexes.length; i++) {
                    const vertex = polygon.vertexes[i];
                    vertexBuffer.data[offset++] = vertex.pos[0]
                    vertexBuffer.data[offset++] = vertex.pos[1]
                    vertexBuffer.data[offset++] = 0
                    vertexBuffer.set(vertex.uv, offset);
                    offset += 2
                }
                vertexBuffer.update();
                vec3.set(subMesh.vertexPositionMin, ...polygon.vertexPosMin, 0);
                vec3.set(subMesh.vertexPositionMax, ...polygon.vertexPosMax, 0);

                const indexBuffer = subMesh.indexInput?.buffer as BufferViewResizable;
                triangulate(polygon.vertexes.length, indexBuffer);
                indexBuffer.update();

                subMesh.vertexOrIndexCount = indexBuffer.length;

                renderer.node.position = vec3.create(...polygon.translation, 0)
            }
            this._polygons_invalidated = false;
        }
    }

    getMeshRenderer(index: number): MeshRenderer {
        let renderer = this._meshRenderers[index];
        if (!renderer) {
            const subMesh: SubMesh = {
                vertexAttributes,
                vertexInput: {
                    buffers: [new BufferViewResizable('Float32', BufferUsageFlagBits.VERTEX)],
                    offsets: [0]
                },
                vertexPositionMin: vec3.create(),
                vertexPositionMax: vec3.create(),
                indexInput: {
                    buffer: new BufferViewResizable('Uint16', BufferUsageFlagBits.INDEX),
                    offset: 0,
                    type: IndexType.UINT16
                },
                vertexOrIndexCount: 0
            }
            renderer = (new Node(`PolygonsRenderer${index}`)).addComponent(MeshRenderer)
            renderer.mesh = { subMeshes: [subMesh] }
            renderer.materials = [this._material];
            this.node.addChild(renderer.node)
            this._meshRenderers[index] = renderer;
        }
        return renderer;
    }
}