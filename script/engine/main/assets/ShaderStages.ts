import { ShaderStageFlagBits } from "gfx";
import { Asset } from "../core/Asset.js";
import { loader } from "../core/impl.js";
import { preprocessor } from "../core/internal/preprocessor.js";

export class ShaderStages extends Asset {
    private _name: string = '';
    public get name(): string {
        return this._name;
    }

    sources: string[] = [];

    types: ShaderStageFlagBits[] = [];

    macros: Set<string> = new Set;

    async load(name: string): Promise<this> {
        const path = `../../assets/shaders/${name}`; // hard code

        let vs = await loader.load(`${path}.vs`, "text");
        vs = await preprocessor.includeExpand(vs);
        this.sources.push(vs)
        this.types.push(ShaderStageFlagBits.VERTEX);

        let fs = await loader.load(`${path}.fs`, "text");
        fs = await preprocessor.includeExpand(fs);
        this.sources.push(fs)
        this.types.push(ShaderStageFlagBits.FRAGMENT);

        this.macros = new Set([...preprocessor.macroExtract(vs), ...preprocessor.macroExtract(fs)]);

        this._name = name;

        return this;
    }
}