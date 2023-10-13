import { ShaderStageFlagBits } from "gfx";
import { load } from "loader";
import { Asset } from "../core/Asset.js";
import { preprocessor } from "../core/internal/preprocessor.js";

export class ShaderStages implements Asset {
    private _name: string = '';
    public get name(): string {
        return this._name;
    }

    sources: string[] = [];

    types: ShaderStageFlagBits[] = [];

    macros: Set<string> = new Set;

    async load(name: string): Promise<this> {
        const path = `../../assets/shaders/${name}`; // hard code

        let vs = await load(`${path}.vs`, "text");
        vs = await preprocessor.includeExpand(vs);
        this.sources.push(vs)
        this.types.push(ShaderStageFlagBits.VERTEX);

        let fs = await load(`${path}.fs`, "text");
        fs = await preprocessor.includeExpand(fs);
        this.sources.push(fs)
        this.types.push(ShaderStageFlagBits.FRAGMENT);

        this.macros = new Set([...preprocessor.macroExtract(vs), ...preprocessor.macroExtract(fs)]);

        this._name = name;

        return this;
    }
}