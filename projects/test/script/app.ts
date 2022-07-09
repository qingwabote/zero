import GLTF from "../../../script/core/assets/GLTF.js";
import MeshRenderer from "../../../script/core/MeshRenderer.js";
import Node from "../../../script/core/Node.js";
import webZero from "../../../script/platforms/webgl/webZero.js";



const canvas = document.querySelector<HTMLCanvasElement>('#GameCanvas')!;
const gl = canvas.getContext('webgl2')!;

webZero.init(gl, canvas.width, canvas.height);

(async () => {
    const glTF = new GLTF();
    await glTF.load('./asset/untitled');

    for (const n of glTF.nodes) {
        const node = new Node();
        node.eulerX = 45;
        node.eulerY = 45;
        node.eulerZ = 45;
        const renderer = node.addComponent(MeshRenderer);
        renderer.mesh = n.mesh;
        renderer.materials = n.materials;
    }

    webZero.run();
})()