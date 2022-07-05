import GLTF from "../../../script/core/assets/GLTF.js";
import game from "../../../script/core/game.js";
import gfx from "../../../script/core/gfx.js";
import { InputAssembler, VertexInputAttributeDescription } from "../../../script/core/InputAssembler.js";
import Model from "../../../script/core/Model.js";
import Pass from "../../../script/core/Pass.js";
import { ShaderStageFlags } from "../../../script/core/Shader.js";
import SubModel from "../../../script/core/SubModel.js";
import webZero from "../../../script/platforms/webgl/webZero.js";

const vs = `
layout(location = 0) in vec4 a_position;

out vec3 v_position;

layout(set = 0, binding = 0) uniform Camera {
    mat4 matProj;
};

void main() {
    v_position = a_position.xyz;

    gl_Position = matProj * a_position;
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

    for (const node of glTF.nodes) {
        const subModels: SubModel[] = [];
        for (const subMesh of node.mesh.subMeshes) {
            const attributeDescriptions: VertexInputAttributeDescription[] = [];
            for (const attribute of subMesh.attributes) {
                const attributeDescription: VertexInputAttributeDescription = {
                    location: 0, // FIXME
                    binding: attribute.binding,
                    format: attribute.format,
                }
                attributeDescriptions.push(attributeDescription);
            }
            const inputAssembler: InputAssembler = { attributes: attributeDescriptions, vertexBuffers: subMesh.vertexBuffers, indexBuffer: subMesh.indexBuffer }
            const subModel = new SubModel(subMesh, [pass], inputAssembler);
            subModels.push(subModel);
        }
        const model = new Model(subModels);
        game.renderScene.models.push(model);
    }

    webZero.run();
})()