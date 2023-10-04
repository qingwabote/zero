import { Text } from "../Asset.js";
import { assetLib } from "../assetLib.js";

async function string_replace(value: string, pattern: RegExp, replacer: (...args: any[]) => Promise<string>): Promise<string> {
    const promises: Promise<string>[] = []
    value.replace(pattern, function (...args): string {
        promises.push(replacer(...args))
        return "";
    });
    const results = await Promise.all(promises);
    return value.replace(pattern, function (): string {
        return results.shift()!;
    });
}

const exp_lineByline = /(.+)\r?\n?/g;
// ^\s* excludes other symbols, like //
const exp_if = /^\s*#if\s+(\w+)/;
const exp_else = /^\s*#else/;
const exp_endif = /^\s*#endif/;

export const preprocessor = {
    macroExtract(src: string): Set<string> {
        const macros: Set<string> = new Set;
        const exp = /^\s*#if\s+(\w+)\r?\n/gm;
        let match;
        while (match = exp.exec(src)) {
            macros.add(match[1]);
        }
        return macros;
    },

    macroExpand(macros: Readonly<Record<string, number>>, source: string): string {
        let out = '';
        const stack: { type: 'if' | 'else', name: string, content: string }[] = [];
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
                const item = stack.pop()!;
                if (item.type != 'if') {
                    const item_if = stack.pop()!;
                    const item_else = item;
                    line = macros[item_if.name] ? item_if.content : item_else.content;
                } else {
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

    async includeExpand(source: string): Promise<string> {
        return string_replace(source, /#include\s+<(.+)>/g, async (_: string, path: string): Promise<string> => {
            const text = await assetLib.cache(`../../assets/shaders/chunks/${path}.chunk`, Text);
            return await this.includeExpand(text.content);
        });
    }
}