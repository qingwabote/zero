import { Asset } from "./Asset.js";

export interface AssetCreateInfo<T> {
    readonly path: string;
    readonly type: new () => T;
}

const _path2asset: Map<string, Asset> = new Map;

export const assetLib = {
    async load<T extends Asset>(path: string, type: new () => T): Promise<T> {
        let instance = _path2asset.get(path) as T;
        if (!instance) {
            instance = new type;
            await instance.load(path);
            _path2asset.set(path, instance);
        }
        return instance as T;
    }
}