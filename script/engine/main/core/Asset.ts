export abstract class Asset {
    abstract load(url: string): Promise<this>;
}