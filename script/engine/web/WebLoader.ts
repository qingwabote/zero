import type { Loader, LoaderTypes } from "engine-main";

export default class WebLoader implements Loader {
    static readonly instance = new WebLoader;

    private static _taskCount = 0;

    get taskCount() {
        return WebLoader._taskCount;
    }

    private constructor() { }

    load<T extends keyof LoaderTypes>(url: string, type: T, onProgress?: (loaded: number, total: number, url: string) => void): Promise<LoaderTypes[T]> {
        url = "../../" + url;// FIXME
        return new Promise((resolve, reject) => {
            const res = function (value: LoaderTypes[T]) { resolve(value); WebLoader._taskCount--; }
            const rej = function (reason: string) { reject(reason); WebLoader._taskCount--; };
            const xhr = new XMLHttpRequest();
            xhr.responseType = type == "bitmap" ? "blob" : type;
            xhr.open('GET', url, true);
            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 0) {
                    if (type == "bitmap") {
                        createImageBitmap(xhr.response, { premultiplyAlpha: 'none' }).then(res as (value: ImageBitmap) => void)
                    } else {
                        res(xhr.response)
                    }
                } else {
                    rej(`download failed: ${url}, status: ${xhr.status}(no response)`)
                }
            };
            // if (onProgress) {
            //     xhr.onprogress = (event) => {
            //         onProgress(event.loaded, event.total, url);
            //     }
            // }
            xhr.onerror = () => {
                rej(`download failed: ${url}, status: ${xhr.status}(error)`);
            };
            xhr.ontimeout = () => {
                rej(`download failed: ${url}, status: ${xhr.status}(time out)`);
            };
            xhr.onabort = () => {
                rej(`download failed: ${url}, status: ${xhr.status}(abort)`);
            };
            xhr.send(null);

            WebLoader._taskCount++;
        })
    }
}