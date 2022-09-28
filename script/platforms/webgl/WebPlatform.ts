import Platfrom from "../../core/Platfrom.js";

export default class WebPlatfrom implements Platfrom {
    decodeImage(buffer: ArrayBuffer): Promise<ImageBitmap> {
        return createImageBitmap(new Blob([buffer]));
    }
}