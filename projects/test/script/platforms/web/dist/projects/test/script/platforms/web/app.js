import GLTF from "../../../../../script/core/assets/GLTF.js";
import Camera from "../../../../../script/core/components/Camera.js";
import Node, { TransformBit } from "../../../../../script/core/Node.js";
import webgame from "../../../../../script/platforms/webgl/webgame.js";
import ZeroComponent from "../../ZeroComponent.js";
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
const eulerXLabel = document.querySelector('#eulerXLabel');
const eulerXInput = document.querySelector('#eulerXInput');
const eulerYLabel = document.querySelector('#eulerYLabel');
const eulerYInput = document.querySelector('#eulerYInput');
const eulerZLabel = document.querySelector('#eulerZLabel');
const eulerZInput = document.querySelector('#eulerZInput');
function updateInput(euler) {
    eulerXInput.valueAsNumber = euler[0];
    eulerYInput.valueAsNumber = euler[1];
    eulerZInput.valueAsNumber = euler[2];
}
function updateLabel(euler) {
    eulerXLabel.textContent = `eulerX: ${euler[0]}`;
    eulerYLabel.textContent = `eulerY: ${euler[1]}`;
    eulerZLabel.textContent = `eulerZ: ${euler[2]}`;
}
function onTransform(flag) {
    if (flag & TransformBit.ROTATION) {
        const euler = node.euler;
        updateInput(euler);
        updateLabel(euler);
    }
}
function onEulerInput() {
    const euler = [eulerXInput.valueAsNumber, eulerYInput.valueAsNumber, eulerZInput.valueAsNumber];
    node.eventEmitter.off("TRANSFORM_CHANGED", onTransform);
    node.euler = euler;
    node.eventEmitter.on("TRANSFORM_CHANGED", onTransform);
    updateLabel(euler);
}
eulerXInput.addEventListener('input', onEulerInput);
eulerYInput.addEventListener('input', onEulerInput);
eulerZInput.addEventListener('input', onEulerInput);
node.eventEmitter.on("TRANSFORM_CHANGED", onTransform);
updateInput(node.euler);
updateLabel(node.euler);
//# sourceMappingURL=app.js.map