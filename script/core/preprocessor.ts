import { DescriptorSetLayout, DescriptorType } from "./gfx/Pipeline.js";
import { Attribute, Meta, ShaderStage, ShaderStageFlagBits, Uniform } from "./gfx/Shader.js";

const ifMacroExp = /#if\s+(\w+)\s+([\s\S]+?)[ \t]*#endif\s*?\n/g;

function includeExpand(chunks: Readonly<Record<string, string>>, source: string): string {
    return source.replace(/#include\s+<(\w+)>/g, function (_: string, name: string): string {
        return includeExpand(chunks, chunks[name]);
    });
}

function macroExpand(macros: Readonly<Record<string, number>>, source: string): string {
    return source.replace(ifMacroExp, function (_: string, macro: string, content: string) {
        return macros[macro] ? content : '';
    });
}

export default {
    macrosExtract(src: string): Set<string> {
        const macros: Set<string> = new Set;
        let matches = src.matchAll(ifMacroExp);
        for (const match of matches) {
            macros.add(match[1]);
        }
        return macros;
    },

    preprocess(chunks: Readonly<Record<string, string>>, stages: Readonly<ShaderStage[]>, macros: Readonly<Record<string, number>>): { out: ShaderStage[], meta: Meta } {
        let out = stages
            .map(stage => ({ type: stage.type, source: includeExpand(chunks, stage.source) }))
            .map(stage => ({ type: stage.type, source: macroExpand(macros, stage.source) }));

        const attributes: Record<string, Attribute> = {};
        let matches = out.find(stage => stage.type == ShaderStageFlagBits.VERTEX)!.source.matchAll(/layout\s*\(\s*location\s*=\s*(\d)\s*\)\s*in\s*\w+\s*(\w+)/g)!;
        for (const match of matches) {
            attributes[match[2]] = { location: parseInt(match[1]) };
        }
        const blocks: Record<string, Uniform> = {};
        const samplerTextures: Record<string, Uniform> = {};
        const descriptorSetLayout: DescriptorSetLayout = { bindings: [] };
        for (const stage of out) {
            stage.source = stage.source.replace(
                /layout\s*\(\s*set\s*=\s*(\d)\s*,\s*binding\s*=\s*(\d)\s*\)\s*uniform\s*(\w*)\s+(\w+)/g,
                function (content: string, set: string, binding: string, type: string, name: string): string {
                    if (!type) {
                        // descriptorSetLayout.bindings.push({ binding: parseInt(binding), descriptorType: DescriptorType.UNIFORM_BUFFER, count: 1 })
                        blocks[name] = { set: parseInt(set), binding: parseInt(binding) };
                    } else if (type == 'sampler2D') {
                        descriptorSetLayout.bindings.push({ binding: parseInt(binding), descriptorType: DescriptorType.SAMPLER_TEXTURE, count: 1 });
                        samplerTextures[name] = { set: parseInt(set), binding: parseInt(binding) };
                    }
                    // remove unsupported layout declaration for webgl, e.g. descriptor sets, no such concept in OpenGL
                    if (typeof window != 'undefined') {
                        return type ? `uniform ${type} ${name}` : `uniform ${name}`;
                    } else {
                        return content;
                    }
                })
        }

        return {
            out,
            meta: {
                attributes,
                blocks,
                samplerTextures,
                descriptorSetLayout
            }
        }
    }
}