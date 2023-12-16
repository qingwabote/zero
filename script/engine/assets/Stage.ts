import { Asset } from "assets";

export class Stage implements Asset {
    load(url: string): Promise<this> {
        throw new Error("Method not implemented.");
    }
}