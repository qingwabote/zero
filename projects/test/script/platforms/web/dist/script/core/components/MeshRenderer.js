import Component from "../Component.js";
import { FormatInfos, VertexInputRate } from "../gfx/Pipeline.js";
import Model from "../render/Model.js";
export default class MeshRenderer extends Component {
    mesh;
    materials;
    start() {
        if (!this.mesh)
            return;
        if (!this.materials)
            return;
        const subModels = [];
        for (let i = 0; i < this.mesh.subMeshes.length; i++) {
            const passes = this.materials[i].passes;
            const subMesh = this.mesh.subMeshes[i];
            const attributes = [];
            const strides = [];
            for (const attribute of subMesh.attributes) {
                const definition = passes[0].shader.info.meta.attributes[attribute.name]; // presume that muti-passes share the same attribute layout.
                if (!definition) {
                    // console.warn(`attribute ${attribute.name} has no definition in ${passes[0].shader.info.name}`)
                    continue;
                }
                const formatInfo = FormatInfos[attribute.format];
                strides[attribute.buffer] = formatInfo.size;
                attributes.push({
                    location: definition.location,
                    binding: attribute.buffer,
                    format: attribute.format,
                    offset: attribute.offset
                });
            }
            const bindings = [];
            for (let binding = 0; binding < subMesh.vertexBuffers.length; binding++) {
                const buffer = subMesh.vertexBuffers[binding];
                bindings.push({
                    binding: binding,
                    stride: buffer.info.stride ? buffer.info.stride : strides[binding],
                    inputRate: VertexInputRate.VERTEX
                });
            }
            const inputAssembler = {
                vertexInputState: {
                    attributes,
                    bindings,
                    hash: "MeshRenderer"
                },
                vertexBuffers: subMesh.vertexBuffers,
                vertexOffsets: subMesh.vertexOffsets,
                indexBuffer: subMesh.indexBuffer,
                indexType: subMesh.indexType,
                indexCount: subMesh.indexCount,
                indexOffset: subMesh.indexOffset
            };
            subModels.push({ inputAssembler, passes });
        }
        const model = new Model(subModels, this._node);
        zero.renderScene.models.push(model);
    }
}
//# sourceMappingURL=MeshRenderer.js.map