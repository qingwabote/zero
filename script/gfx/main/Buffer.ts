import { BufferInfo } from "./info.js";

export interface Buffer {
    get info(): BufferInfo;
    initialize(info: BufferInfo): boolean;
    update(buffer: ArrayBuffer, offset: number, length: number): void;
    resize(size: number): void;
}

export class EmptyBuffer implements Buffer {
    private _info!: BufferInfo;
    get info(): BufferInfo {
        return this._info
    }
    initialize(info: BufferInfo): boolean {
        this._info = info;
        return false;
    }
    update(): void {
    }
    resize(size: number): void {
    }
}