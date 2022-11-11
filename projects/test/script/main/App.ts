import FNT from "../../../../script/core/assets/FNT.js";
import GLTF from "../../../../script/core/assets/GLTF.js";
import Camera from "../../../../script/core/components/Camera.js";
import DirectionalLight from "../../../../script/core/components/DirectionalLight.js";
import FPS from "../../../../script/core/components/FPS.js";
import Label from "../../../../script/core/components/Label.js";
import Sprite from "../../../../script/core/components/Sprite.js";
import { ClearFlagBit } from "../../../../script/core/gfx/Pipeline.js";
import Loader from "../../../../script/core/Loader.js";
import mat3 from "../../../../script/core/math/mat3.js";
import quat from "../../../../script/core/math/quat.js";
import vec3 from "../../../../script/core/math/vec3.js";
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
        node.addComponent(DirectionalLight);
        node.position = [-4, 4, 4];

        const rotation = quat.fromMat3(quat.create(), mat3.fromViewUp(mat3.create(), vec3.normalize(vec3.create(), node.position)));
        node = new Node;
        const cameraLit = node.addComponent(Camera);
        cameraLit.orthoHeight = 4;
        cameraLit.far = 10
        cameraLit.viewport = { x: 0, y: 0, width, height: height * 0.5 };
        node.position = [-4, 4, 4];
        node.rotation = rotation;

        node = new Node;
        const cameraA = node.addComponent(Camera);
        cameraA.fov = 45;
        cameraA.viewport = { x: 0, y: height * 0.5, width, height: height * 0.5 };
        node.position = [0, 0.5, 8]

        // FPS
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
        })();

        (async () => {
            const glTF = new GLTF();
            await glTF.load('./asset/guardian_zelda_botw_fan-art/scene');
            let node = glTF.createScene("Sketchfab_Scene")!;
            node.addComponent(ZeroComponent);

            // const shader = await shaders.getShader('zero', { USE_ALBEDO_MAP: 1 });
            // const texture = new Texture;
            // await texture.load('./asset/MaterialBaseColor.png');

            const shader = await shaders.getShader('depth');
            node = new Node;
            // node.visibility = VisibilityBit.UI;
            const sprite = node.addComponent(Sprite);
            sprite.shader = shader;
            sprite.width = 2;
            sprite.height = 2;
            sprite.texture = this.renderScene.shadowmapPhase.depthStencilAttachment;
            // sprite.texture = texture.gfx_texture;
        })();

        return false;
    }
}

