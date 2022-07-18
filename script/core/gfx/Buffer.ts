export enum BufferUsageBit {
    INDEX = 0x4,
    VERTEX = 0x8,
    UNIFORM = 0x10,
}

export interface BufferInfo {
    readonly usage: BufferUsageBit
    readonly size: number;
    readonly stride?: number;
    // readonly offset: number
}

export default abstract class Buffer {
    protected _info: BufferInfo;
    get info(): BufferInfo {
        return this._info;
    }
    constructor(info: BufferInfo) {
        this._info = info
    }
    abstract update(buffer: Readonly<BufferSource>): void;
}