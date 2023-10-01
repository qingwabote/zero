import type { Loader, LoaderTypes } from "engine-main";

declare const wx: any;

const ext2txt = ['fs', 'vs', 'chunk', 'yml'];

const fs = wx.getFileSystemManager();

export default class WXLoader implements Loader {
    constructor(private _currentPath: string) { }

    load<T extends keyof LoaderTypes>(url: string, type: T, onProgress?: (loaded: number, total: number, url: string) => void): Promise<LoaderTypes[T]> {
        return new Promise((resolve, reject) => {
            const ext = url.substring(url.lastIndexOf('.') + 1);
            if (ext2txt.indexOf(ext) != -1) {
                url = url + '.txt'
            }

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

            if (type == 'bitmap') {
                const image = wx.createImage();
                image.onload = function () {
                    resolve(image);
                }
                image.onerror = function (err: string) {
                    reject(err);
                }
                image.src = url;
            } else {
                fs.readFile({
                    filePath: url,
                    encoding: type == 'text' ? 'utf8' : '',
                    success: function (result: any) {
                        resolve(result.data)
                    },
                    fail: function (result: any) {
                        reject(result.errMsg);
                    }
                });
            }
        })
    }
}