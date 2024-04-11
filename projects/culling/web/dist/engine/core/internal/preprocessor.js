import { bundle } from "bundling";
async function string_replace(value, pattern, replacer) {
    const promises = [];
    value.replace(pattern, function (...args) {
        promises.push(replacer(...args));
        return "";
    });
    const results = await Promise.all(promises);
    return value.replace(pattern, function () {
        return results.shift();
    });
}
const exp_lineByline = /(.+)\r?\n?/g;
// ^\s* excludes other symbols, like //
const exp_if = /^\s*#if\s+(\w+)/;
const exp_else = /^\s*#else/;
const exp_endif = /^\s*#endif/;
export const preprocessor = {
    macroExtract(src) {
        const macros = new Set;
        const exp = /^\s*#if\s+(\w+)\r?\n/gm;
        let match;
        while (match = exp.exec(src)) {
            macros.add(match[1]);
        }
        return macros;
    },
    macroExpand(macros, source) {
        let out = '';
        const stack = [];
        while (true) {
            let res = exp_lineByline.exec(source);
            if (!res) {
                break;
            }
            let line = res[0];
            res = exp_if.exec(line);
            if (res) {
                stack.push({ type: 'if', name: res[1], content: '' });
                continue;
            }
            res = exp_else.exec(line);
            if (res) {
                stack.push({ type: 'else', name: res[1], content: '' });
                continue;
            }
            if (exp_endif.test(line)) {
                const item = stack.pop();
                if (item.type != 'if') {
                    const item_if = stack.pop();
                    const item_else = item;
                    line = macros[item_if.name] ? item_if.content : item_else.content;
                }
                else {
                    const item_if = item;
                    line = macros[item_if.name] ? item_if.content : '';
                }
            }
            if (stack.length) {
                const item = stack[stack.length - 1];
                item.content += line;
                continue;
            }
            out += line;
        }
        return out;
    },
    async includeExpand(source) {
        return string_replace(source, /#include\s+<(.+)>/g, async (_, path) => {
            const text = await bundle.raw.cache(`./shaders/chunks/${path}.chunk`, 'text');
            return await this.includeExpand(text);
        });
    }
};
