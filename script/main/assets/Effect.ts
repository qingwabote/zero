import { parse } from "yaml";
import Asset from "../core/Asset.js";

export default class Effect extends Asset {
    async load(url: string): Promise<this> {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return this;
        }

        const [, parent, name] = res;
        const yml = parse(await loader.load(`${parent}/${name}.yml`, "text"));
        return this;
    }
}