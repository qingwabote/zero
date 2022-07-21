const ifMacroExp = /#if\s+(\w+)\s+([\s\S]+?)[ \t]*#endif\s*?\n/g;

export default {
    macrosExtract(src: string, searchPath: string): Set<string> {
        const macros: Set<string> = new Set;
        let matches = src.matchAll(ifMacroExp);
        for (const match of matches) {
            macros.add(match[1]);
        }
        return macros;
    },

    preprocess(src: string, searchPath: string, macros: Record<string, number>): string {
        return src.replace(ifMacroExp, function (_: string, macro: string, content: string) {
            return macros[macro] ? content : '';
        })
    }
}