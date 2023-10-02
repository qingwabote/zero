import { Asset } from "./Asset.js";

const _path2asset: Map<string, Asset> = new Map;

const _path2pending: Map<string, Promise<any>> = new Map;

export const assetLib = {
    async load<T extends Asset>(path: string, type: new () => T): Promise<T> {
        let instance = _path2asset.get(path) as T;
        if (instance) {
            return instance;
        }

        let pending = _path2pending.get(path);
        if (pending) {
            return await pending;
        }

        instance = new type;
        pending = instance.load(path);
        _path2pending.set(path, pending);
        await pending;
        _path2asset.set(path, instance);
        _path2pending.delete(path);
        return instance;
    }
}