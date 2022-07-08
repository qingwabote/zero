import GLTF from "../../../script/core/assets/GLTF.js";
import gfx from "../../../script/core/gfx.js";
import MeshRenderer from "../../../script/core/MeshRenderer.js";
import Node from "../../../script/core/Node.js";
import Pass from "../../../script/core/Pass.js";
import { ShaderStageFlags } from "../../../script/core/Shader.js";
import webZero from "../../../script/platforms/webgl/webZero.js";

const vs = `
layout(location = 0) in vec4 a_position;

out vec3 v_position;

layout(set = 0, binding = 0) uniform Camera {
    mat4 matProj;
};

layout(set = 1, binding = 0) uniform Local {
    mat4 matWorld;
};

void main() {
    v_position = a_position.xyz;

    gl_Position = matProj * matWorld * a_position;
}
`

const fs = `
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec3 v_position;

out vec4 v_color;

void main() {
    // Just set the output to a constant redish-purple
    v_color = vec4(1, 0, 0.5, 1);
    // v_color = vec4(v_position, 1);
}
`

const canvas = document.querySelector<HTMLCanvasElement>('#GameCanvas')!;
const gl = canvas.getContext('webgl2')!;

webZero.init(gl, canvas.width, canvas.height);

(async () => {
    const glTF = new GLTF();
    await glTF.load('./asset/untitled');

    const shader = gfx.device.createShader({
        name: "zero",
        stages: [
            { type: ShaderStageFlags.VERTEX, source: vs },
            { type: ShaderStageFlags.FRAGMENT, source: fs },
        ]
    });

    const pass = new Pass(shader);

    for (const n of glTF.nodes) {
        const node = new Node();
        node.eulerX = 45;
        node.eulerY = 45;
        // node.eulerZ = 45;
        const renderer = node.addComponent(MeshRenderer);
        renderer.mesh = n.mesh;
        renderer.passes = [pass];
    }

    webZero.run();
})()