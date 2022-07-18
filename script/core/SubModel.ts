import { InputAssembler, VertexInputAttributeDescription } from "./gfx/InputAssembler.js";
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

        const descriptions: VertexInputAttributeDescription[] = [];
        for (const attribute of subMesh.attributes) {
            const definition = passes[0].shader.attributes[attribute.name];
            if (!definition) {
                console.error(`attribute ${attribute.name} has no definition in ${passes[0].shader.info.name}`)
                continue;
            }
            const description: VertexInputAttributeDescription = {
                location: passes[0].shader.attributes[attribute.name].location,// presume that muti-passes share the same attribute layout.
                binding: attribute.buffer,
                format: attribute.format,
                offset: attribute.offset
            }
            descriptions.push(description);
        }
        this._inputAssembler = { attributes: descriptions, vertexBuffers: subMesh.vertexBuffers, indexBuffer: subMesh.indexBuffer };
    }
}