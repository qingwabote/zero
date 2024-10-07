import { BufferInfo } from "./info.js";

export declare class Buffer {
    get info(): BufferInfo;
    private constructor(...args);
    update(src: ArrayBufferView, src_offset: number, src_length: number): void;
    resize(size: number): void;
}