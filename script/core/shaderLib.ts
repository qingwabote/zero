import gfx from "./gfx.js";
import Shader, { ShaderInfo, ShaderStageFlags } from "./gfx/Shader.js"

const _infos: Record<string, ShaderInfo> = {};

let vs = `
layout(location = 0) in vec4 a_position;
layout(location = 2) in vec2 a_texCoord;

out vec2 v_uv;

layout(set = 0, binding = 0) uniform Camera {
    mat4 matProj;
};

layout(set = 1, binding = 0) uniform Local {
    mat4 matWorld;
};

void main() {
    v_uv = a_texCoord;

    gl_Position = matProj * matWorld * a_position;
}
`

let fs = `
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec2 v_uv;

layout(set = 2, binding = 0) uniform sampler2D mainTexture;

out vec4 v_color;

void main() {
    v_color = texture(mainTexture, v_uv);
}
`

let info = {
    name: "zero",
    stages: [
        { type: ShaderStageFlags.VERTEX, source: vs },
        { type: ShaderStageFlags.FRAGMENT, source: fs },
    ]
}
_infos[info.name] = info;

const _shaders: Record<string, Shader> = {};

export default {
    getShader(name: string): Shader {
        if (!_shaders[name]) {
            _shaders[name] = gfx.device.createShader(_infos[name]);
        }
        return _shaders[name];
    }
}