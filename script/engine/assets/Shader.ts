import { Asset } from "assets";
import { load } from "boot";
import { ShaderStageFlagBits } from "gfx";
import { shaderLib } from "../core/shaderLib.js";

export class Shader implements Asset {
    name: string = '';

    sources: string[] = [];

    types: ShaderStageFlagBits[] = [];

    macros: Set<string> = new Set;

    async load(path: string): Promise<this> {
        const preprocessor = shaderLib.preprocessor;

        let vs = await load(`${path}.vs`, "text");
        vs = await preprocessor.includeExpand(vs);
        this.sources.push(vs)
        this.types.push(ShaderStageFlagBits.VERTEX);

        let fs = await load(`${path}.fs`, "text");
        fs = await preprocessor.includeExpand(fs);
        this.sources.push(fs)
        this.types.push(ShaderStageFlagBits.FRAGMENT);

        this.macros = new Set([...preprocessor.macroExtract(vs), ...preprocessor.macroExtract(fs)]);

        this.name = path;

        return this;
    }
}