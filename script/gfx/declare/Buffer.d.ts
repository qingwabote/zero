import { BufferInfo } from "./info.js";

export declare class Buffer {
    get info(): BufferInfo;
    private constructor(...args);
    upload(src: ArrayBufferView, src_offset: number, src_length: number, dst_offset_bytes: number): void;
    resize(size: number): void;
}