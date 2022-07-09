export interface LoaderTypes {
    text: string,
    json: any,
    arraybuffer: ArrayBuffer,
    blob: Blob
}

export interface Loader {
    load<T extends keyof LoaderTypes>(url: String, type: T): Promise<LoaderTypes[T]>;
}

export default abstract class Asset {
    static loader: Loader

    abstract load(url: string): Promise<void>;
}