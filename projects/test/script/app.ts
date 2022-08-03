import GLTF from "../../../script/core/assets/GLTF.js";
import Camera from "../../../script/core/components/Camera.js";
import { Vec3 } from "../../../script/core/math/vec3.js";
import Node, { TransformBit } from "../../../script/core/Node.js";
import webgame from "../../../script/platforms/webgl/webgame.js";
import ZeroComponent from "./ZeroComponent.js";

const canvas = document.querySelector<HTMLCanvasElement>('#ZeroCanvas')!;
webgame.init(canvas);

let node: Node;

node = new Node;
const cameraA = node.addComponent(Camera);
cameraA.fov = 45;
cameraA.viewport = { x: 0, y: 0, width: 0.5, height: 1 };
node.position = [0, 0, 10]

node = new Node;
const cameraB = node.addComponent(Camera);
cameraB.fov = 45;
cameraB.viewport = { x: 0.5, y: 0, width: 0.5, height: 1 };
node.position = [0, 16, 0];
node.euler = [-90, 0, 0];

// (async () => {
const glTF = new GLTF();
await glTF.load('./asset/guardian_zelda_botw_fan-art/scene');
node = glTF.createScene("Sketchfab_Scene")!;

// await glTF.load('./asset/untitled');
// node = glTF.createScene("Scene")!;

node.addComponent(ZeroComponent);

webgame.run();
// })()

const eulerXLabel = document.querySelector<HTMLLabelElement>('#eulerXLabel')!;
const eulerXInput = document.querySelector<HTMLInputElement>('#eulerXInput')!;

const eulerYLabel = document.querySelector<HTMLLabelElement>('#eulerYLabel')!;
const eulerYInput = document.querySelector<HTMLInputElement>('#eulerYInput')!;

const eulerZLabel = document.querySelector<HTMLLabelElement>('#eulerZLabel')!;
const eulerZInput = document.querySelector<HTMLInputElement>('#eulerZInput')!;

function updateInput(euler: Readonly<Vec3>): void {
    eulerXInput.valueAsNumber = euler[0];
    eulerYInput.valueAsNumber = euler[1];
    eulerZInput.valueAsNumber = euler[2];
}

function updateLabel(euler: Readonly<Vec3>): void {
    eulerXLabel.textContent = `eulerX: ${euler[0]}`;
    eulerYLabel.textContent = `eulerY: ${euler[1]}`;
    eulerZLabel.textContent = `eulerZ: ${euler[2]}`;
}

function onTransform(flag: TransformBit) {
    if (flag & TransformBit.ROTATION) {
        const euler = node.euler;
        updateInput(euler);
        updateLabel(euler);
    }
}

function onEulerInput(): void {
    const euler: Vec3 = [eulerXInput.valueAsNumber, eulerYInput.valueAsNumber, eulerZInput.valueAsNumber];
    node.eventEmitter.off("TRANSFORM_CHANGED", onTransform);
    node.euler = euler;
    node.eventEmitter.on("TRANSFORM_CHANGED", onTransform)
    updateLabel(euler);
}

eulerXInput.addEventListener('input', onEulerInput);
eulerYInput.addEventListener('input', onEulerInput);
eulerZInput.addEventListener('input', onEulerInput);

node.eventEmitter.on("TRANSFORM_CHANGED", onTransform)

updateInput(node.euler)
updateLabel(node.euler)
