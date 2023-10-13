interface ResultTypes {
    text: string,
    buffer: ArrayBuffer,
    bitmap: ImageBitmap
}

export function load<T extends keyof ResultTypes>(url: string, type: T, onProgress?: (loaded: number, total: number, url: string) => void): Promise<ResultTypes[T]> {
    url = "../" + url;// FIXME
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        switch (type) {
            case 'text':
                xhr.responseType = 'text'
                break;
            case 'buffer':
                xhr.responseType = 'arraybuffer'
                break;
            case 'bitmap':
                xhr.responseType = 'blob'
                break;
        }
        xhr.open('GET', url, true);
        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 0) {
                if (type == "bitmap") {
                    createImageBitmap(xhr.response, { premultiplyAlpha: 'none' }).then(resolve as (value: ImageBitmap) => void)
                } else {
                    resolve(xhr.response)
                }
            } else {
                reject(`download failed: ${url}, status: ${xhr.status}(no response)`)
            }
        };
        // if (onProgress) {
        //     xhr.onprogress = (event) => {
        //         onProgress(event.loaded, event.total, url);
        //     }
        // }
        xhr.onerror = () => {
            reject(`download failed: ${url}, status: ${xhr.status}(error)`);
        };
        xhr.ontimeout = () => {
            reject(`download failed: ${url}, status: ${xhr.status}(time out)`);
        };
        xhr.onabort = () => {
            reject(`download failed: ${url}, status: ${xhr.status}(abort)`);
        };
        xhr.send(null);
    })
}
