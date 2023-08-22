import { BufferInfo } from "./info.js";

export interface Buffer {
    get info(): BufferInfo;
    initialize(info: BufferInfo): boolean;
    update(buffer: ArrayBuffer, offset: number, length: number): void;
    resize(size: number): void;
}