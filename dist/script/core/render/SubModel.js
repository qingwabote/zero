export default class SubModel {
    _subMesh;
    get subMesh() {
        return this._subMesh;
    }
    _passes;
    get passes() {
        return this._passes;
    }
    _inputAssembler;
    get inputAssembler() {
        return this._inputAssembler;
    }
    constructor(subMesh, passes) {
        this._subMesh = subMesh;
        this._passes = passes;
        const descriptions = [];
        for (const attribute of subMesh.attributes) {
            const definition = passes[0].shader.attributes[attribute.name]; // presume that muti-passes share the same attribute layout.
            if (!definition) {
                // console.warn(`attribute ${attribute.name} has no definition in ${passes[0].shader.info.name}`)
                continue;
            }
            const description = {
                location: definition.location,
                binding: attribute.buffer,
                format: attribute.format,
                offset: attribute.offset
            };
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
//# sourceMappingURL=SubModel.js.map