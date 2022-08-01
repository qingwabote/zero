import GLTF from "../../../script/core/assets/GLTF.js";
import Camera from "../../../script/core/components/Camera.js";
import Node from "../../../script/core/Node.js";
import webgame from "../../../script/platforms/webgl/webgame.js";
import ZeroComponent from "./ZeroComponent.js";
const canvas = document.querySelector('#ZeroCanvas');
webgame.init(canvas);
let node;
node = new Node;
const cameraA = node.addComponent(Camera);
cameraA.fov = 45;
cameraA.viewport = { x: 0, y: 0, width: 0.5, height: 1 };
node.position = [0, 0, 10];
node = new Node;
const cameraB = node.addComponent(Camera);
cameraB.fov = 45;
cameraB.viewport = { x: 0.5, y: 0, width: 0.5, height: 1 };
node.position = [0, 16, 0];
node.euler = [-90, 0, 0];
// (async () => {
const glTF = new GLTF();
await glTF.load('./asset/guardian_zelda_botw_fan-art/scene');
node = glTF.createScene("Sketchfab_Scene");
// await glTF.load('./asset/untitled');
// node = glTF.createScene("Scene")!;
node.addComponent(ZeroComponent);
webgame.run();
// })()
// const origin = node.euler;
// const eulerXLabel = document.querySelector<HTMLLabelElement>('#eulerXLabel')!;
// const eulerXInput = document.querySelector<HTMLInputElement>('#eulerXInput')!;
// eulerXInput.valueAsNumber = origin[0];
// const eulerYLabel = document.querySelector<HTMLLabelElement>('#eulerYLabel')!;
// const eulerYInput = document.querySelector<HTMLInputElement>('#eulerYInput')!;
// eulerYInput.valueAsNumber = origin[1];
// const eulerZLabel = document.querySelector<HTMLLabelElement>('#eulerZLabel')!;
// const eulerZInput = document.querySelector<HTMLInputElement>('#eulerZInput')!;
// eulerZInput.valueAsNumber = origin[2];
// function onEulerInput(): void {
//     node.euler = [eulerXInput.valueAsNumber, eulerYInput.valueAsNumber, eulerZInput.valueAsNumber]
//     eulerXLabel.textContent = `eulerX: ${eulerXInput.valueAsNumber}`;
//     eulerYLabel.textContent = `eulerY: ${eulerYInput.valueAsNumber}`;
//     eulerZLabel.textContent = `eulerZ: ${eulerZInput.valueAsNumber}`;
// }
// eulerXInput.addEventListener('input', onEulerInput);
// eulerYInput.addEventListener('input', onEulerInput);
// eulerZInput.addEventListener('input', onEulerInput);
// onEulerInput()
//# sourceMappingURL=app.js.map