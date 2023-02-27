import Material from "../assets/Material.js";
import Component from "../core/Component.js";
import InputAssembler, { IndexInput, VertexInput, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "../core/gfx/InputAssembler.js";
import { FormatInfos } from "../core/gfx/Pipeline.js";
import Mesh from "../core/render/Mesh.js";
import Model from "../core/render/Model.js";
import SubModel from "../core/render/SubModel.js";

const emptyMesh = { subMeshes: [] };

export default class MeshRenderer extends Component {
    mesh: Mesh = emptyMesh;

    materials: Material[] | undefined;

    private _model!: Model;

    override start(): void {
        if (!this.materials) return;

        const subModels: SubModel[] = [];
        for (let i = 0; i < this.mesh.subMeshes.length; i++) {
            const subMesh = this.mesh.subMeshes[i];
            const bindings: VertexInputBindingDescription[] = [];
            for (let binding = 0; binding < subMesh.vertexBuffers.length; binding++) {
                const buffer = subMesh.vertexBuffers[binding];
                let stride = buffer.info.stride;
                if (!stride) {
                    const attribute = subMesh.vertexAttributes.find(attribute => attribute.buffer == binding)!;
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
                for (const attribute of subMesh.vertexAttributes) {
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
        const model = new Model(subModels);
        zero.scene.models.push(model);
        this._model = model;
    }

    commit(): void {
        if (this.node.hasChanged) {
            this._model.updateBuffer(this.node.matrix);
        }
        this._model.visibilityFlag = this.node.visibilityFlag;
    }
}