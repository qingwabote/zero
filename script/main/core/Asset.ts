class AssetCache {
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

export default abstract class Asset {
    static readonly preloaded: { path: string, type: new () => Asset }[] = [];

    static readonly cache = new AssetCache;

    abstract load(url: string): Promise<this>;
}