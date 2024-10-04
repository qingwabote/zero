import { TextureInfo } from "./info.js";

export declare class Texture {
    get info(): TextureInfo;
    private constructor(...args);
    resize(width: number, height: number): void;
}