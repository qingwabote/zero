import Format from "../gfx/Format.js";
import { Attribute, Meta, ShaderStage, ShaderStageFlagBits, Uniform, UniformMember } from "../gfx/Shader.js";

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

const chunks: Record<string, string> = {};

const exp_lineByline = /(.+)\r?\n?/g;
// ^\s* excludes other symbols, like //
const exp_if = /^\s*#if\s+(\w+)/;
const exp_else = /^\s*#else/;
const exp_endif = /^\s*#endif/;

function macroExpand(macros: Readonly<Record<string, number>>, source: string): string {
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
}

function getFormat(type: string): Format {
    let format: Format;
    switch (type) {
        case "vec2":
            format = Format.RG32_SFLOAT
            break;
        case "vec3":
            format = Format.RGB32_SFLOAT
            break;
        case "vec4":
            format = Format.RGBA32_SFLOAT
            break;
        case "uvec4":
            format = Format.RGBA32_UINT
            break;
        default:
            throw new Error(`unsupported attribute type: ${type}`);
    }
    return format;
}

export default {
    macroExtract(src: string): Set<string> {
        const macros: Set<string> = new Set;
        let matches = src.matchAll(/^\s*#if\s+(\w+)\r?\n/gm);
        for (const match of matches) {
            macros.add(match[1]);
        }
        return macros;
    },

    async includeExpand(source: string): Promise<string> {
        return string_replace(source, /#include\s+<(.+)>/g, async (_: string, path: string): Promise<string> => {
            let chunk = chunks[path];
            if (!chunk) {
                chunk = await loader.load(`../../assets/shaders/chunks/${path}.chunk`, "text");
                chunks[path] = chunk;
            }
            return await this.includeExpand(chunk);
        });
    },

    async preprocess(stages: Readonly<ShaderStage[]>, macros: Readonly<Record<string, number>>): Promise<{ stages: Readonly<ShaderStage[]>, meta: Meta }> {

        stages = stages.map(stage => ({ type: stage.type, source: macroExpand(macros, stage.source) }));

        const vertexStage = stages.find(stage => stage.type == ShaderStageFlagBits.VERTEX)!;

        const attributes: Record<string, Attribute> = {};
        const matches = vertexStage.source.matchAll(/layout\s*\(\s*location\s*=\s*(\d)\s*\)\s*in\s*(\w+)\s*(\w+)/g)!;
        for (const match of matches) {
            const [_, location, type, name] = match;
            attributes[name] = { location: parseInt(location), format: getFormat(type) };
        }

        const blocks: Record<string, Uniform> = {};
        const samplerTextures: Record<string, Uniform> = {};
        for (const stage of stages) {
            const matches = stage.source.matchAll(/layout\s*\(\s*set\s*=\s*(\d)\s*,\s*binding\s*=\s*(\d)\s*\)\s*uniform\s*(\w*)\s+(\w+)\s*(?:\{([^\{\}]*)\})?/g);// 非捕获括号 (?:x))!
            for (const match of matches) {
                const [_, set, binding, type, name, content] = match;
                if (!type) {
                    const members: UniformMember[] = [];
                    for (const match of content.matchAll(/(\w+)\s+(\w+)/g)) {
                        const [_, type, name] = match;
                        members.push({ name, type });
                    }
                    const block = blocks[name];
                    blocks[name] = { set: parseInt(set), binding: parseInt(binding), members, stageFlags: block ? stage.type | block.stageFlags : stage.type };
                } else if (type == 'sampler2D') {
                    const samplerTexture = samplerTextures[name];
                    samplerTextures[name] = { set: parseInt(set), binding: parseInt(binding), stageFlags: samplerTexture ? stage.type | samplerTexture.stageFlags : stage.type };
                }
            }
        }
        return {
            stages,
            meta: {
                attributes,
                blocks,
                samplerTextures
            }
        }
    }
}