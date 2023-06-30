import { TextureInfo } from "./info.js";

export default interface Texture {
    get info(): TextureInfo;
    initialize(info: TextureInfo): boolean;
}