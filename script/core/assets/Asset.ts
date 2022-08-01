export default abstract class Asset {
    abstract load(url: string): Promise<void>;
}