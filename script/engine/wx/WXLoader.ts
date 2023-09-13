import type { Loader, LoaderTypes } from "engine-main";

declare const wx: any;

const fs = wx.getFileSystemManager();

export default class WXLoader implements Loader {
    private static _taskCount = 0;

    get taskCount() {
        return WXLoader._taskCount;
    }

    constructor(private _currentPath: string) { }

    load<T extends keyof LoaderTypes>(url: string, type: T, onProgress?: (loaded: number, total: number, url: string) => void): Promise<LoaderTypes[T]> {
        return new Promise((resolve, reject) => {
            const res = function (value: LoaderTypes[T]) { resolve(value); WXLoader._taskCount--; }
            const rej = function (reason: string) { reject(reason); WXLoader._taskCount--; };

            const heads = this._currentPath.split('/');
            const tails = url.split('/');
            while (tails[0]) {
                if (tails[0] == '.') {
                    tails.shift();
                } else if (tails[0] == '..') {
                    heads.pop();
                    tails.shift();
                } else {
                    break;
                }
            }
            url = heads.length ? (heads.join('/') + '/' + tails.join('/')) : tails.join('/');
            fs.readFile({
                filePath: url,
                success: function (result: any) {
                    if (type == 'bitmap') {

                    } else {
                        res(result.data)
                    }
                },
                fail: function (result: any) {
                    rej(result.errMsg);
                }
            });

            console.log('load', url);
            // const xhr = new XMLHttpRequest();
            // xhr.responseType = type == "bitmap" ? "blob" : type;
            // xhr.open('GET', url, true);
            // xhr.onload = () => {
            //     if (xhr.status === 200 || xhr.status === 0) {
            //         if (type == "bitmap") {
            //             createImageBitmap(xhr.response, { premultiplyAlpha: 'none' }).then(res as (value: ImageBitmap) => void)
            //         } else {
            //             res(xhr.response)
            //         }
            //     } else {
            //         rej(`download failed: ${url}, status: ${xhr.status}(no response)`)
            //     }
            // };
            // // if (onProgress) {
            // //     xhr.onprogress = (event) => {
            // //         onProgress(event.loaded, event.total, url);
            // //     }
            // // }
            // xhr.onerror = () => {
            //     rej(`download failed: ${url}, status: ${xhr.status}(error)`);
            // };
            // xhr.ontimeout = () => {
            //     rej(`download failed: ${url}, status: ${xhr.status}(time out)`);
            // };
            // xhr.onabort = () => {
            //     rej(`download failed: ${url}, status: ${xhr.status}(abort)`);
            // };
            // xhr.send(null);

            WXLoader._taskCount++;
        })
    }
}