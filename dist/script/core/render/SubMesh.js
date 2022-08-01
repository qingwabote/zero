export default class SubMesh {
    _attributes;
    get attributes() {
        return this._attributes;
    }
    _vertexBuffers;
    get vertexBuffers() {
        return this._vertexBuffers;
    }
    _indexBuffer;
    get indexBuffer() {
        return this._indexBuffer;
    }
    _indexType;
    get indexType() {
        return this._indexType;
    }
    _indexCount;
    get indexCount() {
        return this._indexCount;
    }
    _indexOffset;
    get indexOffset() {
        return this._indexOffset;
    }
    constructor(attributes, vertexBuffers, indexBuffer, indexType, indexCount, indexOffset) {
        this._attributes = attributes;
        this._vertexBuffers = vertexBuffers;
        this._indexBuffer = indexBuffer;
        this._indexType = indexType;
        this._indexCount = indexCount;
        this._indexOffset = indexOffset;
    }
}
//# sourceMappingURL=SubMesh.js.map