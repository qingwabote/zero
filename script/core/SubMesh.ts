import Buffer from "./gfx/Buffer.js";
import { Format } from "./gfx.js";

export interface Attribute {
    name: string
    format: Format
    buffer: number
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

    constructor(attributes: Attribute[], vertexBuffers: Buffer[], indexBuffer: Buffer) {
        this._attributes = attributes;
        this._vertexBuffers = vertexBuffers;
        this._indexBuffer = indexBuffer;
    }
} 