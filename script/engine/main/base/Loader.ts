export interface LoaderTypes {
    text: string,
    arraybuffer: ArrayBuffer,
    bitmap: ImageBitmap
}

export interface Loader {
    load<T extends keyof LoaderTypes>(url: String, type: T, onProgress?: (loaded: number, total: number, url: string) => void): Promise<LoaderTypes[T]>;
}