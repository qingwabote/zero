export default class WebLoader {
    load(url, type) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.responseType = type;
            xhr.open('GET', url, true);
            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 0) {
                    resolve(xhr.response);
                }
                else {
                    reject(`download failed: ${url}, status: ${xhr.status}(no response)`);
                }
            };
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
        });
    }
}
//# sourceMappingURL=WebLoader.js.map