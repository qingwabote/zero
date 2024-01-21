import { load } from "boot";
import { ShaderStageFlagBits } from "gfx";
import { preprocessor } from "../core/internal/preprocessor.js";
export class Shader {
    constructor() {
        this.name = '';
        this.sources = [];
        this.types = [];
        this.macros = new Set;
    }
    async load(path) {
        let vs = await load(`${path}.vs`, "text");
        vs = await preprocessor.includeExpand(vs);
        this.sources.push(vs);
        this.types.push(ShaderStageFlagBits.VERTEX);
        let fs = await load(`${path}.fs`, "text");
        fs = await preprocessor.includeExpand(fs);
        this.sources.push(fs);
        this.types.push(ShaderStageFlagBits.FRAGMENT);
        this.macros = new Set([...preprocessor.macroExtract(vs), ...preprocessor.macroExtract(fs)]);
        this.name = path;
        return this;
    }
}
