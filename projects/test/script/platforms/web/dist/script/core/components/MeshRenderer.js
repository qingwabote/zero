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
            const subMesh = this.mesh.subMeshes[i];
            const vertexInput = {
                vertexBuffers: subMesh.vertexBuffers,
                vertexOffsets: subMesh.vertexOffsets,
                indexBuffer: subMesh.indexBuffer,
                indexType: subMesh.indexType,
                indexCount: subMesh.indexCount,
                indexOffset: subMesh.indexOffset
            };
            const inputAssemblers = [];
            const passes = this.materials[i].passes;
            for (let j = 0; j < passes.length; j++) {
                const pass = passes[j];
                const attributes = [];
                const strides = [];
                let hash = "attributes";
                for (const attribute of subMesh.attributes) {
                    const definition = pass.shader.info.meta.attributes[attribute.name];
                    if (!definition) {
                        // console.warn(`attribute ${attribute.name} has no definition in ${pass.shader.info.name}`)
                        continue;
                    }
                    if (definition.format != attribute.format) {
                        throw new Error(`unmatched attribute ${attribute.name} format: mesh ${attribute.format} and shader ${definition.format}`);
                    }
                    const formatInfo = FormatInfos[attribute.format];
                    strides[attribute.buffer] = formatInfo.size;
                    attributes.push({
                        location: definition.location,
                        format: definition.format,
                        binding: attribute.buffer,
                        offset: attribute.offset
                    });
                    hash += definition.location + definition.format + attribute.buffer + attribute.offset;
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
                        hash
                    },
                    vertexInput
                };
                inputAssemblers.push(inputAssembler);
            }
            subModels.push({ inputAssemblers, passes });
        }
        const model = new Model(subModels, this._node);
        zero.renderScene.models.push(model);
    }
}
//# sourceMappingURL=MeshRenderer.js.map