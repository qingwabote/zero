import Buffer from "../gfx/Buffer.js";
import { Format, IndexType } from "../gfx/Pipeline.js";

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

    private _vertexOffsets: number[];
    get vertexOffsets(): number[] {
        return this._vertexOffsets;
    }

    private _indexBuffer: Buffer;
    get indexBuffer(): Buffer {
        return this._indexBuffer;
    }

    private _indexType: IndexType;
    get indexType(): IndexType {
        return this._indexType;
    }

    private _indexCount: number;
    get indexCount(): number {
        return this._indexCount;
    }

    private _indexOffset: number;
    get indexOffset(): number {
        return this._indexOffset;
    }

    constructor(attributes: Attribute[], vertexBuffers: Buffer[], vertexOffsets: number[], indexBuffer: Buffer, indexType: IndexType, indexCount: number, indexOffset: number) {
        this._attributes = attributes;
        this._vertexBuffers = vertexBuffers;
        this._vertexOffsets = vertexOffsets;
        this._indexBuffer = indexBuffer;
        this._indexType = indexType;
        this._indexCount = indexCount;
        this._indexOffset = indexOffset;
    }
} 