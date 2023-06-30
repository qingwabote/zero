import { LoaderTypes } from "../../main/base/Loader.js";

const Loader: Function = loader.constructor;

Loader.prototype.load = function <T extends keyof LoaderTypes>(url: string, type: T): Promise<LoaderTypes[T]> {
    return new Promise((resolve, reject) => {
        this._load(url, type, (res: any) => {
            if (res.error) {
                reject(res.error);
                return;
            }
            switch (type) {
                case "text":
                    resolve(res.takeText());
                    break;
                case "arraybuffer":
                    resolve(res.takeBuffer());
                    break;
                case "bitmap":
                    resolve(res.takeBitmap());
                    break;
            }
        });
    })
};