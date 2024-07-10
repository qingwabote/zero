export var glsl;
(function (glsl) {
    function parse(sources, types) {
        const blocks = {};
        const samplerTextures = {};
        for (let i = 0; i < sources.length; i++) {
            const exp = /layout\s*\(\s*set\s*=\s*(\d)\s*,\s*binding\s*=\s*(\d)\s*\)\s*uniform\s*(\w*)\s+(\w+)\s*(?:\{([^\{\}]*)\})?/g; // 非捕获括号 (?:x))!
            let match;
            while (match = exp.exec(sources[i])) {
                const [_, set, binding, type, name, content] = match;
                if (!type) {
                    const members = {};
                    const exp = /(\w+)\s+(\w+)/g;
                    let match;
                    let offset = 0;
                    while (match = exp.exec(content)) {
                        const [_, type, name] = match;
                        members[name] = { type, offset };
                        switch (type) {
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
                }
                else if (type == 'sampler2D') {
                    const samplerTexture = samplerTextures[name];
                    samplerTextures[name] = { set: parseInt(set), binding: parseInt(binding), stageFlags: samplerTexture ? types[i] | samplerTexture.stageFlags : types[i] };
                }
            }
        }
        return {
            blocks,
            samplerTextures
        };
    }
    glsl.parse = parse;
})(glsl || (glsl = {}));
