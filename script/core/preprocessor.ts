import { DescriptorSetLayout, DescriptorType } from "./gfx/Pipeline.js";
import { Attribute, Meta, ShaderStage, ShaderStageFlags, Uniform } from "./shaders.js";

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

    preprocess(stages: ShaderStage[], searchPath: string, macros: Record<string, number>): { out: ShaderStage[], meta: Meta } {
        const out: ShaderStage[] = [];
        for (const stage of stages) {
            const source = stage.source.replace(ifMacroExp, function (_: string, macro: string, content: string) {
                return macros[macro] ? content : '';
            });
            out.push({ type: stage.type, source });
        }

        const vertexStage = out.find(stage => stage.type == ShaderStageFlags.VERTEX)!;
        const attributes: Record<string, Attribute> = {};
        let matches = vertexStage.source.matchAll(/layout\s*\(\s*location\s*=\s*(\d)\s*\)\s*in\s*\w+\s*(\w+)/g)!;
        for (const match of matches) {
            attributes[match[2]] = { location: parseInt(match[1]) }
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
                    if (window) {
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