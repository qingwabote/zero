import { Format } from "./Format.js";
import { ShaderStageFlagBits } from "./info.js";

export interface Attribute {
    readonly location: number
    readonly format: Format
}

export interface UniformMember {
    readonly name: string
    readonly type: string
}

export interface Uniform {
    readonly set: number;
    readonly binding: number;
    readonly members?: readonly UniformMember[];
    readonly stageFlags: ShaderStageFlagBits;
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

export const glsl = {
    parse(sources: string[], types: ShaderStageFlagBits[]): {
        readonly attributes: Record<string, Attribute>;
        readonly blocks: Record<string, Uniform>;
        readonly samplerTextures: Record<string, Uniform>;
    } {
        const vs = sources[types.indexOf(ShaderStageFlagBits.VERTEX)];

        const attributes: Record<string, Attribute> = {};
        const matches = vs.matchAll(/layout\s*\(\s*location\s*=\s*(\d)\s*\)\s*in\s*(\w+)\s*(\w+)/g)!;
        for (const match of matches) {
            const [_, location, type, name] = match;
            attributes[name] = { location: parseInt(location), format: getFormat(type) };
        }

        const blocks: Record<string, Uniform> = {};
        const samplerTextures: Record<string, Uniform> = {};
        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            const matches = source.matchAll(/layout\s*\(\s*set\s*=\s*(\d)\s*,\s*binding\s*=\s*(\d)\s*\)\s*uniform\s*(\w*)\s+(\w+)\s*(?:\{([^\{\}]*)\})?/g);// 非捕获括号 (?:x))!
            for (const match of matches) {
                const [_, set, binding, type, name, content] = match;
                if (!type) {
                    const members: UniformMember[] = [];
                    for (const match of content.matchAll(/(\w+)\s+(\w+)/g)) {
                        const [_, type, name] = match;
                        members.push({ name, type });
                    }
                    const block = blocks[name];
                    blocks[name] = { set: parseInt(set), binding: parseInt(binding), members, stageFlags: block ? types[i] | block.stageFlags : types[i] };
                } else if (type == 'sampler2D') {
                    const samplerTexture = samplerTextures[name];
                    samplerTextures[name] = { set: parseInt(set), binding: parseInt(binding), stageFlags: samplerTexture ? types[i] | samplerTexture.stageFlags : types[i] };
                }
            }
        }
        return {
            attributes,
            blocks,
            samplerTextures
        }
    }
}