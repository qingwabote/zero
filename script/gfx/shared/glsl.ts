import { ShaderStageFlagBits } from "./constants.js";

interface UniformMember {
    readonly type: string
    readonly offset: number
}

interface Uniform {
    readonly set: number;
    readonly binding: number;
    readonly stageFlags: ShaderStageFlagBits;
    readonly members?: Readonly<Record<string, UniformMember>>;
    readonly size?: number
}

interface Meta {
    readonly blocks: Record<string, Uniform>;
    readonly samplerTextures: Record<string, Uniform>;
}

export const glsl = {
    parse(sources: readonly string[], types: readonly ShaderStageFlagBits[]): Meta {
        const blocks: Record<string, Uniform> = {};
        const samplerTextures: Record<string, Uniform> = {};
        for (let i = 0; i < sources.length; i++) {
            const exp = /layout\s*\(\s*set\s*=\s*(\d)\s*,\s*binding\s*=\s*(\d)\s*\)\s*uniform\s*(\w*)\s+(\w+)\s*(?:\{([^\{\}]*)\})?/g // 非捕获括号 (?:x))!
            let match;
            while (match = exp.exec(sources[i])) {
                const [_, set, binding, type, name, content] = match;
                if (!type) {
                    const members: Record<string, UniformMember> = {};
                    const exp = /(\w+)\s+(\w+)/g;
                    let match;
                    let offset = 0;
                    while (match = exp.exec(content)) {
                        const [_, type, name] = match;
                        members[name] = { type, offset }
                        switch (type) {
                            case "Instance":
                                break;
                            case "vec3":
                            case "vec4":
                                offset += 4;
                                break;
                            case "mat4":
                                offset += 16;
                                break;
                            default:
                                throw new Error(`unsupported uniform member type: ${type}`);
                        }
                    }
                    const block = blocks[name];
                    blocks[name] = { set: parseInt(set), binding: parseInt(binding), members, size: offset, stageFlags: block ? types[i] | block.stageFlags : types[i] };
                } else if (type == 'sampler2D') {
                    const samplerTexture = samplerTextures[name];
                    samplerTextures[name] = { set: parseInt(set), binding: parseInt(binding), stageFlags: samplerTexture ? types[i] | samplerTexture.stageFlags : types[i] };
                }
            }
        }
        return {
            blocks,
            samplerTextures
        }
    }
}

export declare namespace glsl {
    export { Uniform, UniformMember, Meta }
}