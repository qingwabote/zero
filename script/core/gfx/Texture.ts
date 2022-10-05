export interface TextureInfo {
    width: number;
    height: number;
}

export default interface Texture {
    initialize(info: TextureInfo): boolean;
}