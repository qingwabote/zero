import { ShaderStageFlagBits } from "./constants.js";

export namespace glsl {
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

    export function parse(sources: readonly string[], types: readonly ShaderStageFlagBits[]): {
        readonly blocks: Record<string, Uniform>;
        readonly samplerTextures: Record<string, Uniform>;
    } {
        const blocks: Record<string, Uniform> = {};
        const samplerTextures: Record<string, Uniform> = {};
        for (let i = 0; i < sources.length; i++) {
            const exp = /layout\s*\(\s*set\s*=\s*(\d)\s*,\s*binding\s*=\s*(\d)\s*\)\s*uniform\s*(\w*)\s+(\w+)\s*(?:\{([^\{\}]*)\})?/g // 非捕获括号 (?:x))!
            let match;
            while (match = exp.exec(sources[i])) {
                const [_, set, binding, type, name, content] = match;
                if (!type) {
                    const members: UniformMember[] = [];
                    const exp = /(\w+)\s+(\w+)/g;
                    let match;
                    while (match = exp.exec(content)) {
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
            blocks,
            samplerTextures
        }
    }
}