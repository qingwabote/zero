import { LoaderTypes, Zero } from "engine-main";

const Loader: Function = (globalThis as any)._zero_loader.constructor;

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

export function run(App: new (...args: ConstructorParameters<typeof Zero>) => Zero) {
    const zero = new App();

    function mainLoop(timestamp: number) {
        zero.tick(new Map, timestamp);

        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}