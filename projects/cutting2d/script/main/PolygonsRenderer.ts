import Material from "../../../../script/main/assets/Material.js";
import MeshRenderer from "../../../../script/main/components/MeshRenderer.js";
import UIElement from "../../../../script/main/components/ui/internal/UIElement.js";
import Node from "../../../../script/main/core/Node.js";
import Format, { FormatInfos } from "../../../../script/main/core/gfx/Format.js";
import Texture from "../../../../script/main/core/gfx/Texture.js";
import { BufferUsageFlagBits, CullMode, IndexType, PrimitiveTopology } from "../../../../script/main/core/gfx/info.js";
import vec2, { Vec2 } from "../../../../script/main/core/math/vec2.js";
import vec3 from "../../../../script/main/core/math/vec3.js";
import vec4 from "../../../../script/main/core/math/vec4.js";
import Pass from "../../../../script/main/core/scene/Pass.js";
import SubMesh, { VertexAttribute } from "../../../../script/main/core/scene/SubMesh.js";
import BufferViewResizable from "../../../../script/main/core/scene/buffers/BufferViewResizable.js";
import shaderLib from "../../../../script/main/core/shaderLib.js";
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
        const rasterizationState = new gfx.RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const state = new gfx.PassState();
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