import { InputAssembler, VertexInputAttributeDescription } from "./InputAssembler.js";
import Pass from "./Pass.js";
import SubMesh from "./SubMesh.js";

export default class SubModel {
    private _subMesh: SubMesh;
    get subMesh(): SubMesh {
        return this._subMesh;
    }

    private _passes: Pass[];
    get passes(): Pass[] {
        return this._passes;
    }

    private _inputAssembler: InputAssembler;
    get inputAssembler(): InputAssembler {
        return this._inputAssembler;
    }

    constructor(subMesh: SubMesh, passes: Pass[]) {
        this._subMesh = subMesh;
        this._passes = passes;

        const attributeDescriptions: VertexInputAttributeDescription[] = [];
        for (const attribute of subMesh.attributes) {
            const attributeDescription: VertexInputAttributeDescription = {
                location: 0, // FIXME
                binding: attribute.binding,
                format: attribute.format,
            }
            attributeDescriptions.push(attributeDescription);
        }
        this._inputAssembler = { attributes: attributeDescriptions, vertexBuffers: subMesh.vertexBuffers, indexBuffer: subMesh.indexBuffer };
    }
}