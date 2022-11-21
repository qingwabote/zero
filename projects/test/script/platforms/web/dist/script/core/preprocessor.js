import { Format } from "./gfx/Pipeline.js";
import { ShaderStageFlagBits } from "./gfx/Shader.js";
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
const chunks = {};
const ifMacroExp = / *#if\s+(\w+)\r?\n([\s\S]+?)#endif\r?\n/g;
async function includeExpand(source) {
    return string_replace(source, /#include\s+<(\w+)>/g, async function (_, name) {
        let chunk = chunks[name];
        if (!chunk) {
            chunk = await zero.loader.load(`../../asset/shader/chunks/${name}.chunk`, "text");
            chunks[name] = chunk;
        }
        return await includeExpand(chunk);
    });
}
function macroExpand(macros, source) {
    return source.replace(ifMacroExp, function (_, macro, content) {
        const matches = content.match(/([\s\S]+)#else\r?\n([\s\S]+)/);
        if (!matches) {
            return macros[macro] ? content : '';
        }
        return macros[macro] ? matches[1] : matches[2];
    });
}
export default {
    macrosExtract(src) {
        const macros = new Set;
        let matches = src.matchAll(ifMacroExp);
        for (const match of matches) {
            macros.add(match[1]);
        }
        return macros;
    },
    async preprocess(stages, macros) {
        stages = await Promise.all(stages.map(async (stage) => ({ type: stage.type, source: await includeExpand(stage.source) })));
        stages = stages.map(stage => ({ type: stage.type, source: macroExpand(macros, stage.source) }));
        const vertexStage = stages.find(stage => stage.type == ShaderStageFlagBits.VERTEX);
        const fragmentStage = stages.find(stage => stage.type == ShaderStageFlagBits.FRAGMENT);
        const attributes = {};
        let matches = vertexStage.source.matchAll(/layout\s*\(\s*location\s*=\s*(\d)\s*\)\s*in\s*(\w+)\s*(\w+)/g);
        for (const match of matches) {
            const [_, location, type, name] = match;
            let format;
            switch (type) {
                case "vec2":
                    format = Format.RG32F;
                    break;
                case "vec3":
                    format = Format.RGB32F;
                    break;
                case "vec4":
                    format = Format.RGBA32F;
                    break;
                default:
                    throw new Error(`unsupported attribute type: ${type}`);
            }
            attributes[name] = { location: parseInt(location), format };
        }
        // remove unsupported layout qualifier for webgl
        vertexStage.source = vertexStage.source.replace(/layout\s*\(\s*location\s*=\s*\d\s*\)\s*out/g, function (content) {
            if (typeof window != 'undefined') {
                return "out";
            }
            return content;
        });
        fragmentStage.source = fragmentStage.source.replace(/layout\s*\(\s*location\s*=\s*\d\s*\)\s*in/g, function (content) {
            if (typeof window != 'undefined') {
                return "in";
            }
            return content;
        });
        const blocks = {};
        const samplerTextures = {};
        for (const stage of stages) {
            stage.source = stage.source.replace(/layout\s*\(\s*set\s*=\s*(\d)\s*,\s*binding\s*=\s*(\d)\s*\)\s*uniform\s*(\w*)\s+(\w+)/g, function (content, set, binding, type, name) {
                if (!type) {
                    // bindings.push({ binding: parseInt(binding), descriptorType: DescriptorType.UNIFORM_BUFFER, count: 1 })
                    blocks[name] = { set: parseInt(set), binding: parseInt(binding) };
                }
                else if (type == 'sampler2D') {
                    samplerTextures[name] = { set: parseInt(set), binding: parseInt(binding) };
                }
                // remove unsupported layout qualifier for WebGL, e.g. descriptor sets, no such concept in WebGL, even OpenGL
                if (typeof window != 'undefined') {
                    return type ? `uniform ${type} ${name}` : `uniform ${name}`;
                }
                return content;
            });
        }
        return {
            stages,
            meta: {
                attributes,
                blocks,
                samplerTextures
            }
        };
    }
};
//# sourceMappingURL=preprocessor.js.map