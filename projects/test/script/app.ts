import GLTF from "../../../script/core/assets/GLTF.js";
import game from "../../../script/core/game.js";
import gfx, { InputAssembler, ShaderStageBit, VertexInputAttributeDescription } from "../../../script/core/gfx.js";
import Model from "../../../script/core/Model.js";
import Pass from "../../../script/core/Pass.js";
import SubModel from "../../../script/core/SubModel.js";
import webZero from "../../../script/platforms/webgl/webZero.js";

const vs = `#version 300 es
    
in vec4 a_position;

out vec3 v_position;

void main() {
    mat4 aMat4 = mat4(0.5, 0.0, 0.0, 0.0,
                      0.0, 0.5, 0.0, 0.0, 
                      0.0, 0.0, 0.5, 0.0,
                      0.0, 0.0, 0.0, 1.0);

    v_position = a_position.xyz;

    gl_Position = aMat4 * a_position;
}
`

const fs = `#version 300 es

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
// gl.viewport(0, 0, canvas.width, canvas.height);

webZero.init(gl);

(async () => {
    const glTF = new GLTF();
    await glTF.load('./asset/untitled');

    const shader = gfx.device.createShader({
        name: "zero",
        stages: [
            { type: ShaderStageBit.VERTEX, source: vs },
            { type: ShaderStageBit.FRAGMENT, source: fs },
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