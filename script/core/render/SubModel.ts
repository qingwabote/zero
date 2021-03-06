import { InputAssembler, VertexInputAttributeDescription } from "../gfx/InputAssembler.js";
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
    get inputAssembler(): Readonly<InputAssembler> {
        return this._inputAssembler;
    }

    constructor(subMesh: SubMesh, passes: Pass[]) {
        this._subMesh = subMesh;
        this._passes = passes;

        const descriptions: VertexInputAttributeDescription[] = [];
        for (const attribute of subMesh.attributes) {
            const definition = passes[0].shader.attributes[attribute.name];// presume that muti-passes share the same attribute layout.
            if (!definition) {
                // console.warn(`attribute ${attribute.name} has no definition in ${passes[0].shader.info.name}`)
                continue;
            }
            const description: VertexInputAttributeDescription = {
                location: definition.location,
                binding: attribute.buffer,
                format: attribute.format,
                offset: attribute.offset
            }
            descriptions.push(description);
        }
        this._inputAssembler = {
            attributes: descriptions,
            vertexBuffers: subMesh.vertexBuffers,
            indexBuffer: subMesh.indexBuffer,
            indexType: subMesh.indexType,
            indexCount: subMesh.indexCount,
            indexOffset: subMesh.indexOffset
        };
    }
}