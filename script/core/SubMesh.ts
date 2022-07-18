import Buffer from "./gfx/Buffer.js";
import { Format } from "./gfx.js";

export interface Attribute {
    readonly name: string
    readonly format: Format
    readonly buffer: number
    readonly offset: number
}

export default class SubMesh {
    private _attributes: Attribute[];
    get attributes(): Attribute[] {
        return this._attributes;
    }

    private _vertexBuffers: Buffer[];
    get vertexBuffers(): Buffer[] {
        return this._vertexBuffers;
    }

    private _indexBuffer: Buffer;
    get indexBuffer(): Buffer {
        return this._indexBuffer;
    }

    private _indexType: Format;
    get indexType(): Format {
        return this._indexType;
    }

    constructor(attributes: Attribute[], vertexBuffers: Buffer[], indexBuffer: Buffer, indexType: Format) {
        this._attributes = attributes;
        this._vertexBuffers = vertexBuffers;
        this._indexBuffer = indexBuffer;
        this._indexType = indexType;
    }
} 