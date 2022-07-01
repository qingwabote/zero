import { Loader, LoaderTypes } from "../../core/assets/Asset.js";

export default class WebLoader implements Loader {
    load<T extends keyof LoaderTypes>(url: string, type: T): Promise<LoaderTypes[T]> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.responseType = type;
            xhr.open('GET', url, true);
            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 0) {
                    resolve(xhr.response)
                } else {
                    reject(`download failed: ${url}, status: ${xhr.status}(no response)`)
                }
            };
            xhr.onerror = () => {
                reject(`download failed: ${url}, status: ${xhr.status}(error)`)
            };
            xhr.ontimeout = () => {
                reject(`download failed: ${url}, status: ${xhr.status}(time out)`)
            };
            xhr.onabort = () => {
                reject(`download failed: ${url}, status: ${xhr.status}(abort)`)
            };
            xhr.send(null);
        })
    }
}