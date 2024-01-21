import { load } from "boot";
class Text {
    constructor() {
        this._content = '';
    }
    get content() {
        return this._content;
    }
    async load(url) {
        this._content = await load(url, 'text');
        return this;
    }
}
class Buffer {
    get content() {
        return this._content;
    }
    async load(url) {
        this._content = await load(url, 'buffer');
        return this;
    }
}
class Bitmap {
    get content() {
        return this._content;
    }
    async load(url) {
        this._content = await load(url, 'bitmap');
        return this;
    }
}
const _url2asset = new Map;
const _url2pending = new Map;
export function resolve(root, path) {
    const heads = root.split('/');
    const tails = path.split('/');
    while (tails[0]) {
        if (tails[0] == '.') {
            tails.shift();
        }
        else if (tails[0] == '..') {
            const res = heads.pop();
            if (res == '.') {
                continue;
            }
            if (!res) {
                break;
            }
            tails.shift();
        }
        else {
            break;
        }
    }
    return heads.length ? (heads.join('/') + '/' + tails.join('/')) : tails.join('/');
}
export async function cache(url, type) {
    let asset = _url2asset.get(url);
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
export async function once(url, type) {
    const asset = new type;
    return asset.load(url);
}
export class Raw {
    constructor(_root) {
        this._root = _root;
    }
    async cache(path, type) {
        switch (type) {
            case 'text':
                return (await cache(resolve(this._root, path), Text)).content;
            case 'buffer':
                return (await cache(resolve(this._root, path), Buffer)).content;
            case 'bitmap':
                return (await cache(resolve(this._root, path), Bitmap)).content;
            default:
                throw new Error(`unsupported type: ${type}`);
        }
    }
    async once(path, type) {
        switch (type) {
            case 'text':
                return (await once(resolve(this._root, path), Text)).content;
            case 'buffer':
                return (await once(resolve(this._root, path), Buffer)).content;
            case 'bitmap':
                return (await cache(resolve(this._root, path), Bitmap)).content;
            default:
                throw new Error(`unsupported type: ${type}`);
        }
    }
}
export class Bundle {
    constructor(root) {
        this.root = root;
        this.raw = new Raw(root);
    }
    cache(path, type) {
        return cache(this.resolve(path), type);
    }
    once(path, type) {
        return once(this.resolve(path), type);
    }
    resolve(path) {
        return resolve(this.root, path);
    }
}
