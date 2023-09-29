import type { LoaderTypes } from "engine-main";

const zero = (globalThis as any).zero;

const Loader: Function = zero.loader.constructor;

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

// for phys ammo
(globalThis as any).phys = {
    getWasm: function () {
        return zero.loader.load('../../assets/physics/ammo.wasm.wasm', 'arraybuffer');
    }
};