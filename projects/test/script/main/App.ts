import GLTF from "../../../../script/core/assets/GLTF.js";
import Camera from "../../../../script/core/components/Camera.js";
import Device from "../../../../script/core/gfx/Device.js";
import Loader from "../../../../script/core/Loader.js";
import Node from "../../../../script/core/Node.js";
import Platfrom from "../../../../script/core/Platfrom.js";
import Zero from "../../../../script/core/Zero.js";
import ZeroComponent from "./ZeroComponent.js";

export default class App extends Zero {
    initialize(device: Device, loader: Loader, platfrom: Platfrom, width: number, height: number): boolean {
        if (super.initialize(device, loader, platfrom, width, height)) {
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
        node.position = [0, 16, 0];
        node.euler = [-90, 0, 0];

        (async () => {
            const glTF = new GLTF();
            await glTF.load('./asset/guardian_zelda_botw_fan-art/scene');
            const node = glTF.createScene("Sketchfab_Scene")!;
            node.addComponent(ZeroComponent);
        })();

        // await glTF.load('./asset/untitled');
        // node = glTF.createScene("Scene")!;


        return false;
    }
}

