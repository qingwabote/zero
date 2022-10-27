import FNT from "../../../../script/core/assets/FNT.js";
import GLTF from "../../../../script/core/assets/GLTF.js";
import Camera from "../../../../script/core/components/Camera.js";
import FPS from "../../../../script/core/components/FPS.js";
import Label from "../../../../script/core/components/Label.js";
import { ClearFlagBit } from "../../../../script/core/gfx/Pipeline.js";
import Loader from "../../../../script/core/Loader.js";
import Node from "../../../../script/core/Node.js";
import Platfrom from "../../../../script/core/Platfrom.js";
import VisibilityBit from "../../../../script/core/render/VisibilityBit.js";
import shaders from "../../../../script/core/shaders.js";
import Zero from "../../../../script/core/Zero.js";
import ZeroComponent from "./ZeroComponent.js";

export default class App extends Zero {
    initialize(loader: Loader, platfrom: Platfrom, width: number, height: number): boolean {
        if (super.initialize(loader, platfrom, width, height)) {
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

        // FPS
        node = new Node;
        const camera = node.addComponent(Camera);
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
        })();

        (async () => {
            const glTF = new GLTF();
            await glTF.load('./asset/guardian_zelda_botw_fan-art/scene');
            const node = glTF.createScene("Sketchfab_Scene")!;
            node.addComponent(ZeroComponent);
        })();

        return false;
    }
}

