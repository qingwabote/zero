
declare const loader: { currentPath: string };

const ext2txt = ['fs', 'vs', 'chunk', 'yml'];

declare const wx: any;
const fs = wx.getFileSystemManager();

interface ResultTypes {
    text: string,
    buffer: ArrayBuffer,
    bitmap: ImageBitmap
}

export function load<T extends keyof ResultTypes>(url: string, type: T, onProgress?: (loaded: number, total: number, url: string) => void): Promise<ResultTypes[T]> {
    return new Promise((resolve, reject) => {
        const ext = url.substring(url.lastIndexOf('.') + 1);
        if (ext2txt.indexOf(ext) != -1) {
            url = url + '.txt'
        }

        const heads = loader.currentPath.split('/');
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
