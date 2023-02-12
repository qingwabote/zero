import Platfrom from "../../main/Platform.js";

export default class WebPlatfrom implements Platfrom {
    decodeImage(buffer: ArrayBuffer): Promise<ImageBitmap> {
        return createImageBitmap(new Blob([buffer]));
    }
}