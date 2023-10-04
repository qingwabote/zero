import { Asset } from "./Asset.js";

const _url2asset: Map<string, Asset> = new Map;
const _url2pending: Map<string, Promise<any>> = new Map;

export const assetLib = {
    async cache<T extends Asset>(url: string, type: new () => T): Promise<T> {
        let asset = _url2asset.get(url) as T;
        if (asset) {
            return asset;
        }

        let pending = _url2pending.get(url);
        if (pending) {
            return await pending;
        }

        asset = new type;
        pending = asset.load(url);
        _url2pending.set(url, pending);
        await pending;
        _url2asset.set(url, asset);
        _url2pending.delete(url);
        return asset;
    }
}