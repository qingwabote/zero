export interface TextureInfo {

}

export default abstract class Texture {
    abstract update(imageBitmap: ImageBitmap): void;
}