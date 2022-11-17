import FNT from "../../../../script/core/assets/FNT.js";
import GLTF from "../../../../script/core/assets/GLTF.js";
import Camera from "../../../../script/core/components/Camera.js";
import DirectionalLight from "../../../../script/core/components/DirectionalLight.js";
import FPS from "../../../../script/core/components/FPS.js";
import Label from "../../../../script/core/components/Label.js";
import Sprite from "../../../../script/core/components/Sprite.js";
import { ClearFlagBit } from "../../../../script/core/gfx/Pipeline.js";
import Loader from "../../../../script/core/Loader.js";
import quat from "../../../../script/core/math/quat.js";
import vec3, { Vec3 } from "../../../../script/core/math/vec3.js";
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

        const lit_position: Vec3 = [4, 4, 4];

        let node: Node;

        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = lit_position;

        node = new Node;
        const lit_camera = node.addComponent(Camera);
        lit_camera.orthoHeight = 4;
        lit_camera.far = 10
        lit_camera.viewport = { x: 0, y: 0, width, height: height * 0.5 };
        node.position = lit_position;
        node.rotation = quat.rotationTo(quat.create(), vec3.create(0, 0, -1), vec3.normalize(vec3.create(), vec3.negate(vec3.create(), lit_position)));

        node = new Node;
        const cameraA = node.addComponent(Camera);
        cameraA.fov = 45;
        // cameraA.orthoHeight = 4;
        // cameraA.far = 20
        cameraA.viewport = { x: 0, y: height * 0.5, width, height: height * 0.5 };
        node.position = [0, 0.5, 8];
        // node.rotation = quat.rotationTo(quat.create(), vec3.create(0, 0, -1), vec3.normalize(vec3.create(), vec3.negate(vec3.create(), node.position)));

        // UI
        node = new Node;
        const camera = node.addComponent(Camera);
        camera.visibilities = VisibilityBit.UI;
        camera.clearFlags = ClearFlagBit.DEPTH;
        camera.orthoHeight = height / 2;
        camera.viewport = { x: 0, y: 0, width, height };
        node.position = [0, 0, 1];
        (async () => {
            const zero = await shaders.getShader('zero', { USE_ALBEDO_MAP: 1 });
            const fnt = new FNT;
            await fnt.load('./asset/zero');
            node = new Node;
            const label = node.addComponent(Label);
            label.fnt = fnt;
            label.shader = zero;
            node.addComponent(FPS);
            node.position = [-width / 2, height / 2, 0];
            node.visibility = VisibilityBit.UI;

            const shader = await shaders.getShader('depth');
            node = new Node;
            node.position = [width / 2 - 200, -height / 2 + 200, 0];
            node.visibility = VisibilityBit.UI;
            const sprite = node.addComponent(Sprite);
            sprite.shader = shader;
            sprite.width = 200;
            sprite.height = 200;
            sprite.texture = this.renderScene.shadowmapPhase.depthStencilAttachment;
        })();

        (async () => {
            let glTF: GLTF;
            let node: Node;
            glTF = new GLTF();
            await glTF.load('./asset/guardian_zelda_botw_fan-art/scene');
            node = glTF.createScene("Sketchfab_Scene")!;
            node.addComponent(ZeroComponent);

            glTF = new GLTF();
            await glTF.load('./asset/plane');
            node = glTF.createScene("Scene")!;
            node.scale = [4, 4, 4];
        })();

        return false;
    }
}

