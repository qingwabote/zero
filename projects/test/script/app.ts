import GLTF from "../../../script/core/assets/GLTF.js";
import Node from "../../../script/core/Node.js";
import webZero from "../../../script/platforms/webgl/webZero.js";
import ZeroComponent from "./ZeroComponent.js";

const canvas = document.querySelector<HTMLCanvasElement>('#ZeroCanvas')!;
const gl = canvas.getContext('webgl2')!;

webZero.init(gl, canvas.width, canvas.height);

let node: Node;

// (async () => {
const glTF = new GLTF();
await glTF.load('./asset/untitled');

node = glTF.createScene("Scene");
node.addComponent(ZeroComponent);

webZero.run();
// })()

const eulerXLabel = document.querySelector<HTMLLabelElement>('#eulerXLabel')!;
const eulerXInput = document.querySelector<HTMLInputElement>('#eulerXInput')!;

const eulerYLabel = document.querySelector<HTMLLabelElement>('#eulerYLabel')!;
const eulerYInput = document.querySelector<HTMLInputElement>('#eulerYInput')!;

const eulerZLabel = document.querySelector<HTMLLabelElement>('#eulerZLabel')!;
const eulerZInput = document.querySelector<HTMLInputElement>('#eulerZInput')!;

function onEulerInput(): void {
    node.euler = [eulerXInput.valueAsNumber, eulerYInput.valueAsNumber, eulerZInput.valueAsNumber]
    eulerXLabel.textContent = `eulerX: ${eulerXInput.valueAsNumber}`;
    eulerYLabel.textContent = `eulerY: ${eulerYInput.valueAsNumber}`;
    eulerZLabel.textContent = `eulerZ: ${eulerZInput.valueAsNumber}`;
}

eulerXInput.addEventListener('input', onEulerInput);
eulerYInput.addEventListener('input', onEulerInput);
eulerZInput.addEventListener('input', onEulerInput);

onEulerInput()