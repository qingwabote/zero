import Asset from "./Asset.js";

export interface AssetCreateInfo<T> {
    readonly path: string;
    readonly type: new () => T;
}

const _path2asset: Map<string, Asset> = new Map;

export default {

    async load<T extends Asset>(info: AssetCreateInfo<T>): Promise<T> {
        let instance = _path2asset.get(info.path) as T;
        if (!instance) {
            instance = new info.type;
            await instance.load(info.path);
            _path2asset.set(info.path, instance);
        }
        return instance as T;
    },

    get<T extends Asset>(info: AssetCreateInfo<T>): T {
        return _path2asset.get(info.path) as T;
    }
}