const ifMacroExp = /#if\s+(\w+)\s+([\s\S]+?)[ \t]*#endif\s*?\n/g;
export default {
    macrosExtract(src, searchPath) {
        const macros = new Set;
        let matches = src.matchAll(ifMacroExp);
        for (const match of matches) {
            macros.add(match[1]);
        }
        return macros;
    },
    preprocess(src, searchPath, macros) {
        return src.replace(ifMacroExp, function (_, macro, content) {
            return macros[macro] ? content : '';
        });
    }
};
//# sourceMappingURL=preprocessor.js.map