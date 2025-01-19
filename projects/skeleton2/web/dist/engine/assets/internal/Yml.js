import { resolve } from "assets";
import { load } from "boot";
import { bundle } from "bundling";
import { parse } from "yaml";
const _variables = {
    ENGINE_ASSETS: bundle.root
};
const null_object = Object.freeze({});
export class Yml {
    constructor() {
        this._base = '';
    }
    async load(url) {
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
    resolvePath(path) {
        return path[0] == '.' ? resolve(this._base, path) : path;
    }
    resolveVar(value, variables = null_object) {
        return value.replace(/\${(.+)}/g, function (_, name) {
            var _a;
            let value = (_a = variables[name]) !== null && _a !== void 0 ? _a : _variables[name];
            if (value != undefined) {
                return value;
            }
            throw new Error(`unsupported variable: ${name}`);
        });
    }
}
