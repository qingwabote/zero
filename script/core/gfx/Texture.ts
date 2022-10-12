export interface TextureInfo {
    width: number;
    height: number;
}

export default interface Texture {
    get info(): TextureInfo;
    initialize(info: TextureInfo): boolean;
}