import FNT from "../../../../script/main/assets/FNT.js";
import Camera from "../../../../script/main/components/Camera.js";
import FPS from "../../../../script/main/components/FPS.js";
import Label from "../../../../script/main/components/Label.js";
import MeshRenderer from "../../../../script/main/components/MeshRenderer.js";
import Buffer, { BufferUsageFlagBits, MemoryUsage } from "../../../../script/main/gfx/Buffer.js";
import { ClearFlagBit, Format, IndexType } from "../../../../script/main/gfx/Pipeline.js";
import Loader from "../../../../script/main/Loader.js";
import Node from "../../../../script/main/Node.js";
import Platfrom from "../../../../script/main/Platfrom.js";
import Material from "../../../../script/main/render/Material.js";
import Mesh from "../../../../script/main/render/Mesh.js";
import Pass from "../../../../script/main/render/Pass.js";
import SubMesh, { Attribute } from "../../../../script/main/render/SubMesh.js";
import VisibilityBit from "../../../../script/main/render/VisibilityBit.js";
import shaders from "../../../../script/main/shaders.js";
import Zero from "../../../../script/main/Zero.js";
import ZeroComponent from "./ZeroComponent.js";

export default class App extends Zero {
    initialize(loader: Loader, platfrom: Platfrom, width: number, height: number): boolean {
        if (super.initialize(loader, platfrom, width, height)) {
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

        const vertexBuffer = gfx.createBuffer();
        vertexBuffer.initialize({ usage: BufferUsageFlagBits.VERTEX, size: vertexArray.byteLength, mem_usage: MemoryUsage.CPU_TO_GPU });
        vertexBuffer.update(vertexArray);
        vertexBuffers.push(vertexBuffer);
        vertexOffsets.push(0);

        const indexArray = new Uint16Array([0, 1, 2]);
        const indexBuffer = gfx.createBuffer();
        indexBuffer.initialize({ usage: BufferUsageFlagBits.INDEX, size: indexArray.byteLength, mem_usage: MemoryUsage.CPU_TO_GPU });
        indexBuffer.update(indexArray);

        const mesh: Mesh = new Mesh([new SubMesh(attributes, vertexBuffers, vertexOffsets, indexBuffer, IndexType.UINT16, indexArray.length, 0)]);
        (async () => {
            const shader = await shaders.getShader('triangle');
            const pass = new Pass(shader);
            const material = new Material([pass]);

            node = new Node;
            const renderer = node.addComponent(MeshRenderer);
            renderer.mesh = mesh;
            renderer.materials = [material];

            node.addComponent(ZeroComponent);
        })()



        // if (1 + 1 == 2) {
        //     return false;
        // }

        // FPS
        node = new Node;
        camera = node.addComponent(Camera);
        camera.visibilities = VisibilityBit.UI;
        camera.clearFlags = ClearFlagBit.DEPTH;
        camera.orthoHeight = height / 2;
        camera.viewport = { x: 0, y: 0, width: 1, height: 1 };
        node.position = [0, 0, 1];

        (async () => {
            const shader = await shaders.getShader('zero', { USE_ALBEDO_MAP: 1 });
            const fnt = new FNT;
            await fnt.load('./asset/zero');
            const node = new Node;
            const label = node.addComponent(Label);
            label.fnt = fnt;
            label.shader = shader;
            node.addComponent(FPS);
            node.position = [-width / 2, height / 2, 0];
            node.visibility = VisibilityBit.UI;
        })()

        return false;
    }
}

