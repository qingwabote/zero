import Material from "../assets/Material.js";
import Component from "../Component.js";
import InputAssembler, { IndexInput, VertexInput, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "../gfx/InputAssembler.js";
import { FormatInfos } from "../gfx/Pipeline.js";
import Mesh from "../render/Mesh.js";
import Model from "../render/Model.js";
import SubModel from "../render/SubModel.js";

export default class MeshRenderer extends Component {
    mesh: Mesh | undefined;

    materials: Material[] | undefined;

    override start(): void {
        if (!this.mesh) return;
        if (!this.materials) return;

        const subModels: SubModel[] = [];
        for (let i = 0; i < this.mesh.subMeshes.length; i++) {
            const subMesh = this.mesh.subMeshes[i];
            const bindings: VertexInputBindingDescription[] = [];
            for (let binding = 0; binding < subMesh.vertexBuffers.length; binding++) {
                const buffer = subMesh.vertexBuffers[binding];
                let stride = buffer.info.stride;
                if (!stride) {
                    const attribute = subMesh.attributes.find(attribute => attribute.buffer == binding)!;
                    stride = FormatInfos[attribute.format].size;
                }
                bindings.push({
                    binding,
                    stride,
                    inputRate: VertexInputRate.VERTEX
                })
            }
            const vertexInput: VertexInput = {
                vertexBuffers: subMesh.vertexBuffers,
                vertexOffsets: subMesh.vertexOffsets,
            }
            const indexInput: IndexInput = {
                indexBuffer: subMesh.indexBuffer,
                indexOffset: subMesh.indexOffset,
                indexType: subMesh.indexType,
            }
            const inputAssemblers: InputAssembler[] = [];
            const passes = this.materials[i].passes;
            for (let j = 0; j < passes.length; j++) {
                const pass = passes[j];
                const attributes: VertexInputAttributeDescription[] = [];
                for (const attribute of subMesh.attributes) {
                    const definition = pass.state.shader.info.meta.attributes[attribute.name];
                    if (!definition) {
                        // console.warn(`attribute ${attribute.name} has no definition in ${pass.shader.info.name}`)
                        continue;
                    }
                    if (definition.format != attribute.format) {
                        throw new Error(`unmatched attribute ${attribute.name} format: mesh ${attribute.format} and shader ${definition.format}`);
                    }

                    attributes.push({
                        location: definition.location,
                        format: definition.format,
                        binding: attribute.buffer,
                        offset: attribute.offset
                    });
                }

                const inputAssembler = gfx.createInputAssembler();
                inputAssembler.initialize({
                    vertexInputState: new VertexInputState(
                        attributes,
                        bindings
                    ),
                    vertexInput,
                    indexInput
                })
                inputAssemblers.push(inputAssembler);
            }
            subModels.push({ inputAssemblers, passes, vertexOrIndexCount: subMesh.indexCount });
        }
        const model = new Model(subModels, this._node);
        zero.renderScene.models.push(model);
    }
}