import FNT from "../../../../script/core/assets/FNT.js";
import Camera from "../../../../script/core/components/Camera.js";
import FPS from "../../../../script/core/components/FPS.js";
import Label from "../../../../script/core/components/Label.js";
import MeshRenderer from "../../../../script/core/components/MeshRenderer.js";
import Buffer, { BufferUsageFlagBits } from "../../../../script/core/gfx/Buffer.js";
import Device from "../../../../script/core/gfx/Device.js";
import { ClearFlagBit, Format, IndexType } from "../../../../script/core/gfx/Pipeline.js";
import Loader from "../../../../script/core/Loader.js";
import Node from "../../../../script/core/Node.js";
import Platfrom from "../../../../script/core/Platfrom.js";
import Material from "../../../../script/core/render/Material.js";
import Mesh from "../../../../script/core/render/Mesh.js";
import Pass from "../../../../script/core/render/Pass.js";
import SubMesh, { Attribute } from "../../../../script/core/render/SubMesh.js";
import shaders from "../../../../script/core/shaders.js";
import Zero from "../../../../script/core/Zero.js";
import ZeroComponent from "./ZeroComponent.js";

export default class App extends Zero {
    initialize(device: Device, loader: Loader, platfrom: Platfrom, width: number, height: number): boolean {
        if (super.initialize(device, loader, platfrom, width, height)) {
            return true;
        }

        let node: Node;
        let camera: Camera;

        node = new Node;
        camera = node.addComponent(Camera);
        camera.fov = 45;
        camera.viewport = { x: 0, y: 0, width: 1, height: 1 };
        node.position = [0, 0, 10]

        const vertexArray = new Float32Array([
            1, 1, 0, 1,
            -1, 1, 0, 1,
            0, -1, 0, 1
        ]);

        const attributes: Attribute[] = [];
        const vertexBuffers: Buffer[] = [];
        const vertexOffsets: number[] = [];

        const attribute: Attribute = {
            name: "a_position",
            format: Format.RGBA32F,
            buffer: 0,
            offset: 0
        };
        attributes.push(attribute);

        const vertexBuffer = zero.gfx.createBuffer();
        vertexBuffer.initialize({ usage: BufferUsageFlagBits.VERTEX, size: vertexArray.byteLength });
        vertexBuffer.update(vertexArray);
        vertexBuffers.push(vertexBuffer);
        vertexOffsets.push(0);

        const indexArray = new Uint16Array([0, 1, 2]);
        const indexBuffer = zero.gfx.createBuffer();
        indexBuffer.initialize({ usage: BufferUsageFlagBits.INDEX, size: indexArray.byteLength });
        indexBuffer.update(indexArray);

        const mesh: Mesh = new Mesh([new SubMesh(attributes, vertexBuffers, vertexOffsets, indexBuffer, IndexType.UINT16, indexArray.length, 0)]);
        const shader = shaders.getShader('triangle');
        const pass = new Pass(shader);
        const material = new Material([pass]);

        node = new Node;
        const renderer = node.addComponent(MeshRenderer);
        renderer.mesh = mesh;
        renderer.materials = [material];

        node.addComponent(ZeroComponent);


        // if (1 + 1 == 2) {
        //     return false;
        // }

        // FPS
        node = new Node;
        camera = node.addComponent(Camera);
        camera.clearFlag = ClearFlagBit.DEPTH;
        camera.orthoHeight = height / 2;
        camera.viewport = { x: 0, y: 0, width: 1, height: 1 };
        node.position = [0, 0, 1];

        (async () => {
            const fnt = new FNT;
            await fnt.load('./asset/zero');
            const node = new Node;
            const label = node.addComponent(Label);
            label.fnt = fnt;
            node.addComponent(FPS);
            node.position = [-width / 2, height / 2, 0]
        })()

        return false;
    }
}

