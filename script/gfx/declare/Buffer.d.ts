import { BufferInfo } from "./info.js";

export declare class Buffer {
    get info(): BufferInfo;
    private constructor(...args);
    initialize(info: BufferInfo): boolean;
    update(buffer: ArrayBuffer, offset: number, length: number): void;
    resize(size: number): void;
}