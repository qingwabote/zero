import Camera from "../../../../script/core/components/Camera.js";
import MeshRenderer from "../../../../script/core/components/MeshRenderer.js";
import Buffer, { BufferUsageBit } from "../../../../script/core/gfx/Buffer.js";
import Device from "../../../../script/core/gfx/Device.js";
import { Format } from "../../../../script/core/gfx/InputAssembler.js";
import Loader from "../../../../script/core/Loader.js";
import Node from "../../../../script/core/Node.js";
import Material from "../../../../script/core/render/Material.js";
import Mesh from "../../../../script/core/render/Mesh.js";
import Pass from "../../../../script/core/render/Pass.js";
import SubMesh, { Attribute } from "../../../../script/core/render/SubMesh.js";
import shaders from "../../../../script/core/shaders.js";
import Zero from "../../../../script/core/Zero.js";
import ZeroComponent from "./ZeroComponent.js";

export default class App extends Zero {
    initialize(device: Device, loader: Loader, width: number, height: number): boolean {
        if (super.initialize(device, loader, width, height)) {
            return true;
        }

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

        const vertexBuffer = zero.device.createBuffer();
        vertexBuffer.initialize({ usage: BufferUsageBit.VERTEX, size: vertexArray.byteLength });
        vertexBuffer.update(vertexArray);
        vertexBuffers.push(vertexBuffer);

        const indexArray = new Uint8Array([0, 1, 2]);
        const indexBuffer = zero.device.createBuffer();
        indexBuffer.initialize({ usage: BufferUsageBit.INDEX, size: indexArray.byteLength });
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

        return false;
    }
}

