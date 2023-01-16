import Asset from "./assets/Asset.js";

export default class AssetCache {

    static readonly preloadedAssets: { path: string, type: new () => Asset }[] = [];

    static readonly instance = new AssetCache;

    private _path2asset: Map<string, Asset> = new Map;

    async load<T extends Asset>(path: string, type: new () => T): Promise<T> {
        let instance = this._path2asset.get(path) as T;
        if (!instance) {
            instance = new type;
            await instance.load(path);
            this._path2asset.set(path, instance);
        }
        return instance as T;
    }

    get<T extends Asset>(path: string, type: new () => T): T {
        return this._path2asset.get(path) as T;
    }
}