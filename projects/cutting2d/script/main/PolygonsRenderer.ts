import Material from "../../../../script/main/assets/Material.js";
import MeshRenderer from "../../../../script/main/components/MeshRenderer.js";
import BoundedRenderer from "../../../../script/main/components/internal/BoundedRenderer.js";
import UIContainer from "../../../../script/main/components/ui/UIContainer.js";
import UIRenderer from "../../../../script/main/components/ui/UIRenderer.js";
import ShaderLib from "../../../../script/main/core/ShaderLib.js";
import { BufferUsageFlagBits } from "../../../../script/main/core/gfx/Buffer.js";
import Format, { FormatInfos } from "../../../../script/main/core/gfx/Format.js";
import { IndexType } from "../../../../script/main/core/gfx/InputAssembler.js";
import { CullMode } from "../../../../script/main/core/gfx/Pipeline.js";
import Texture from "../../../../script/main/core/gfx/Texture.js";
import vec3 from "../../../../script/main/core/math/vec3.js";
import vec4 from "../../../../script/main/core/math/vec4.js";
import Pass from "../../../../script/main/core/scene/Pass.js";
import SubMesh, { VertexAttribute } from "../../../../script/main/core/scene/SubMesh.js";
import BufferViewResizable from "../../../../script/main/core/scene/buffers/BufferViewResizable.js";
import { Polygon } from "./Polygon.js";

ShaderLib.preloaded.push({ name: 'unlit', macros: { USE_ALBEDO_MAP: 1 } });

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

export default class PolygonsRenderer extends UIContainer {
    private _polygons: readonly Polygon[] = [];
    public get polygons(): readonly Polygon[] {
        return this._polygons;
    }
    public set polygons(value: readonly Polygon[]) {
        this._polygons = value;
    }

    texture!: Texture;

    private _material!: Material;

    private _meshRenderers: MeshRenderer[] = [];

    start(): void {
        const pass = new Pass({ shader: ShaderLib.instance.getShader('unlit', { USE_ALBEDO_MAP: 1 }), rasterizationState: { cullMode: CullMode.NONE } });
        pass.setUniform('Constants', 'albedo', vec4.ONE);
        pass.setTexture('albedoMap', this.texture);
        this._material = { passes: [pass] };

        for (let i = 0; i < this._polygons.length; i++) {
            const polygon = this._polygons[i];
            const renderer = this.getMeshRenderer(i);
            const subMesh = renderer.mesh.subMeshes[0];
            vec3.set(subMesh.vertexPositionMin, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0);
            vec3.set(subMesh.vertexPositionMax, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, 0);
            const vertexBuffer = subMesh.vertexInput.buffers[0] as BufferViewResizable;
            vertexBuffer.reset(5 * polygon.vertexes.length);
            let offset = 0;
            for (let i = 0; i < polygon.vertexes.length; i++) {
                const vertex = polygon.vertexes[i];
                const [x, y] = [vertex.pos[0] / BoundedRenderer.PIXELS_PER_UNIT, vertex.pos[1] / BoundedRenderer.PIXELS_PER_UNIT];
                vertexBuffer.data[offset++] = x
                vertexBuffer.data[offset++] = y
                vertexBuffer.data[offset++] = 0
                vertexBuffer.set(vertex.uv, offset);
                offset += 2

                subMesh.vertexPositionMin[0] = Math.min(subMesh.vertexPositionMin[0], x)
                subMesh.vertexPositionMin[1] = Math.min(subMesh.vertexPositionMin[1], y)
                subMesh.vertexPositionMax[0] = Math.max(subMesh.vertexPositionMax[0], x)
                subMesh.vertexPositionMax[1] = Math.max(subMesh.vertexPositionMax[1], y)
            }
            vertexBuffer.update();

            const indexBuffer = subMesh.indexInput?.buffer as BufferViewResizable;
            triangulate(polygon.vertexes.length, indexBuffer);
            indexBuffer.update();

            subMesh.vertexOrIndexCount = indexBuffer.length;
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
            const ui = UIRenderer.create(MeshRenderer);
            renderer = ui.impl;
            renderer.mesh = { subMeshes: [subMesh] }
            renderer.materials = [this._material];
            this.addElement(ui);
            this._meshRenderers[index] = renderer;
        }
        return renderer;
    }
}