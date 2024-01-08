import { Asset, resolve } from "assets";
import { load } from "boot";
import { bundle } from "bundling";
import { parse } from "yaml";

const _variables: Record<string, any> = {
    ENGINE_ASSETS: bundle.root
}

export abstract class Yml implements Asset {
    private _base: string = '';

    async load(url: string): Promise<this> {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return this;
        }

        const [, base, name] = res;
        const text = await load(`${base}/${name}.yml`, "text");
        this._base = base;
        await this.onParse(parse(text));
        return this;
    }

    protected abstract onParse(res: any): Promise<void>;

    protected resolvePath(path: string): string {
        return path[0] == '.' ? resolve(this._base, path) : path;
    }

    protected resolveVar(value: string, variables: Record<string, any> = {}): string {
        return value.replace(/\${(.+)}/g, function (_, name: string) {
            let value = variables[name] ?? _variables[name];
            if (value != undefined) {
                return value;
            }
            throw `unsupported variable: ${name}`;
        })
    }
}