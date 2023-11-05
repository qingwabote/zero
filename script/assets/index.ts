import { ResultTypes, load } from "loader";

export interface Asset {
    load(url: string): Promise<this>;
}

class Text implements Asset {
    private _content: string = '';
    public get content(): string {
        return this._content;
    }

    async load(url: string): Promise<this> {
        this._content = await load(url, 'text');
        return this;
    }
}

class Buffer implements Asset {
    private _content!: ArrayBuffer;
    public get content(): ArrayBuffer {
        return this._content;
    }

    async load(url: string): Promise<this> {
        this._content = await load(url, 'buffer');
        return this;
    }
}

const _url2asset: Map<string, Asset> = new Map;
const _url2pending: Map<string, Promise<any>> = new Map;

function resolvePath(root: string, path: string) {
    const heads = root.split('/');
    const tails = path.split('/');
    while (tails[0]) {
        if (tails[0] == '.') {
            tails.shift();
        } else if (tails[0] == '..') {
            const res = heads.pop();
            if (res == '.') {
                continue;
            }
            if (!res) {
                break;
            }
            tails.shift();
        } else {
            break;
        }
    }
    return heads.length ? (heads.join('/') + '/' + tails.join('/')) : tails.join('/');
}

export async function cache<T extends Asset>(url: string, type: new () => T): Promise<T> {
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

export async function once<T extends Asset>(url: string, type: new () => T): Promise<T> {
    const asset = new type;
    return asset.load(url);
}


export class Raw {
    constructor(private _root: string) { }
    async cache<T extends keyof ResultTypes>(path: string, type: T): Promise<ResultTypes[T]> {
        switch (type) {
            case 'text':
                return (await cache(resolvePath(this._root, path), Text)).content as ResultTypes[T];
            case 'buffer':
                return (await cache(resolvePath(this._root, path), Buffer)).content as ResultTypes[T];
            default:
                throw new Error(`unsupported type: ${type}`);
        }
    }
    async once<T extends keyof ResultTypes>(path: string, type: T): Promise<ResultTypes[T]> {
        switch (type) {
            case 'text':
                return (await once(resolvePath(this._root, path), Text)).content as ResultTypes[T];
            case 'buffer':
                return (await once(resolvePath(this._root, path), Buffer)).content as ResultTypes[T];
            default:
                throw new Error(`unsupported type: ${type}`);
        }
    }
}

export class Bundle {
    readonly raw: Raw;
    constructor(private _root: string) {
        this.raw = new Raw(_root);
    }
    cache<T extends Asset>(path: string, type: new () => T): Promise<T> {
        return cache(resolvePath(this._root, path), type);
    }
    once<T extends Asset>(path: string, type: new () => T): Promise<T> {
        return once(resolvePath(this._root, path), type);
    }
}