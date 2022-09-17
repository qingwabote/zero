import { FormatInfos, InputAssembler, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate } from "../gfx/Pipeline.js";
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

        const attributes: VertexInputAttributeDescription[] = [];
        const strides: number[] = [];
        for (const attribute of subMesh.attributes) {
            const definition = passes[0].shader.info.meta.attributes[attribute.name];// presume that muti-passes share the same attribute layout.
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
        const bindings: VertexInputBindingDescription[] = [];
        for (let binding = 0; binding < subMesh.vertexBuffers.length; binding++) {
            const buffer = subMesh.vertexBuffers[binding];
            bindings.push({
                binding: binding,
                stride: buffer.info.stride ? buffer.info.stride : strides[binding],
                inputRate: VertexInputRate.VERTEX
            })
        }

        this._inputAssembler = {
            bindings,
            attributes,
            vertexBuffers: subMesh.vertexBuffers,
            indexBuffer: subMesh.indexBuffer,
            indexType: subMesh.indexType,
            indexCount: subMesh.indexCount,
            indexOffset: subMesh.indexOffset
        };
    }
}