import Asset from "./Asset.js";

export interface AssetCreateInfo<T> {
    readonly path: string;
    readonly type: new () => T;
}

export default class AssetLib {
    static readonly preloaded: AssetCreateInfo<Asset>[] = [];

    static readonly instance = new AssetLib;

    private _path2asset: Map<string, Asset> = new Map;

    async load<T extends Asset>(info: AssetCreateInfo<T>): Promise<T> {
        let instance = this._path2asset.get(info.path) as T;
        if (!instance) {
            instance = new info.type;
            await instance.load(info.path);
            this._path2asset.set(info.path, instance);
        }
        return instance as T;
    }

    get<T extends Asset>(info: AssetCreateInfo<T>): T {
        return this._path2asset.get(info.path) as T;
    }
}