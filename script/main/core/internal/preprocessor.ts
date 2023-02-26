import { Format } from "../gfx/Pipeline.js";
import { Attribute, Meta, ShaderStage, ShaderStageFlagBits, Uniform } from "../gfx/Shader.js";

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
                chunk = await loader.load(`../../assets/shader/chunks/${path}.chunk`, "text");
                chunks[path] = chunk;
            }
            return await this.includeExpand(chunk);
        });
    },

    async preprocess(stages: Readonly<ShaderStage[]>, macros: Readonly<Record<string, number>>): Promise<{ stages: Readonly<ShaderStage[]>, meta: Meta }> {

        stages = stages.map(stage => ({ type: stage.type, source: macroExpand(macros, stage.source) }));

        const vertexStage = stages.find(stage => stage.type == ShaderStageFlagBits.VERTEX)!;
        const fragmentStage = stages.find(stage => stage.type == ShaderStageFlagBits.FRAGMENT)!;

        const attributes: Record<string, Attribute> = {};
        let matches = vertexStage.source.matchAll(/layout\s*\(\s*location\s*=\s*(\d)\s*\)\s*in\s*(\w+)\s*(\w+)/g)!;
        for (const match of matches) {
            const [_, location, type, name] = match;
            let format: Format;
            switch (type) {
                case "vec2":
                    format = Format.RG32F
                    break;
                case "vec3":
                    format = Format.RGB32F
                    break;
                case "vec4":
                    format = Format.RGBA32F
                    break;
                default:
                    throw new Error(`unsupported attribute type: ${type}`);
            }
            attributes[name] = { location: parseInt(location), format };
        }

        // remove unsupported layout qualifier for webgl
        vertexStage.source = vertexStage.source.replace(/layout\s*\(\s*location\s*=\s*\d\s*\)\s*out/g,
            function (content: string): string {
                if (typeof window != 'undefined') {
                    return "out"
                }
                return content;
            }
        );
        fragmentStage.source = fragmentStage.source.replace(/layout\s*\(\s*location\s*=\s*\d\s*\)\s*in/g,
            function (content: string): string {
                if (typeof window != 'undefined') {
                    return "in"
                }
                return content;
            }
        );

        const blocks: Record<string, Uniform> = {};
        const samplerTextures: Record<string, Uniform> = {};
        for (const stage of stages) {
            stage.source = stage.source.replace(
                /^\s*layout\s*\(\s*set\s*=\s*(\d)\s*,\s*binding\s*=\s*(\d)\s*\)\s*uniform\s*(\w*)\s+(\w+)/gm,
                function (content: string, set: string, binding: string, type: string, name: string): string {
                    if (!type) {
                        // bindings.push({ binding: parseInt(binding), descriptorType: DescriptorType.UNIFORM_BUFFER, count: 1 })
                        blocks[name] = { set: parseInt(set), binding: parseInt(binding) };
                    } else if (type == 'sampler2D') {
                        samplerTextures[name] = { set: parseInt(set), binding: parseInt(binding) };
                    }
                    // remove unsupported layout qualifier for WebGL, e.g. descriptor sets, no such concept in WebGL, even OpenGL
                    if (typeof window != 'undefined') {
                        return type ? `uniform ${type} ${name}` : `uniform ${name}`;
                    }
                    return content;
                })
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