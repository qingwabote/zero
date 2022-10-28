export default interface Platfrom {
    decodeImage(buffer: ArrayBuffer): Promise<ImageBitmap>;
}