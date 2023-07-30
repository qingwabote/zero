import { TextureInfo } from "./info.js";

export interface Texture {
    get info(): TextureInfo;
    initialize(info: TextureInfo): boolean;
}