export interface TextureInfo {
    width: number;
    height: number;
}

export default abstract class Texture {
    abstract update(imageBitmap: ImageBitmap): void;
}