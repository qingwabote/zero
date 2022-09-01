import Camera from "../../../../../script/core/components/Camera.js";
import MeshRenderer from "../../../../../script/core/components/MeshRenderer.js";
import gfx from "../../../../../script/core/gfx.js";
import Buffer, { BufferUsageBit } from "../../../../../script/core/gfx/Buffer.js";
import { Format } from "../../../../../script/core/gfx/InputAssembler.js";
import { Vec3 } from "../../../../../script/core/math/vec3.js";
import Node, { TransformBit } from "../../../../../script/core/Node.js";
import Material from "../../../../../script/core/render/Material.js";
import Mesh from "../../../../../script/core/render/Mesh.js";
import Pass from "../../../../../script/core/render/Pass.js";
import SubMesh, { Attribute } from "../../../../../script/core/render/SubMesh.js";
import shaders from "../../../../../script/core/shaders.js";
import webgame from "../../../../../script/platforms/webgl/webgame.js";
import ZeroComponent from "../../main/ZeroComponent.js";

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
node.position = [0, 30, 10];
node.euler = [-60, 0, 0];

const vertexArray = new Float32Array([
    1, 1, 0, 1,
    -1, 1, 0, 1,
    0, -1, 0, 1
]);

const attributes: Attribute[] = [];
const vertexBuffers: Buffer[] = [];

const attribute: Attribute = {
    name: "a_position",
    format: Format.RGBA32F,
    buffer: 0,
    offset: 0
};
attributes.push(attribute);

const vertexBuffer = gfx.device.createBuffer({ usage: BufferUsageBit.VERTEX, size: vertexArray.byteLength });
vertexBuffer.update(vertexArray);
vertexBuffers.push(vertexBuffer);

const indexArray = new Uint8Array([0, 1, 2]);
const indexBuffer = gfx.device.createBuffer({ usage: BufferUsageBit.INDEX, size: indexArray.byteLength });
indexBuffer.update(indexArray);

const mesh: Mesh = new Mesh([new SubMesh(attributes, vertexBuffers, indexBuffer, Format.R8UI, indexArray.length, 0)]);
const shader = shaders.getShader('triangle');
const pass = new Pass(shader);
const material = new Material([pass]);

node = new Node;
const renderer = node.addComponent(MeshRenderer);
renderer.mesh = mesh;
renderer.materials = [material];

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

