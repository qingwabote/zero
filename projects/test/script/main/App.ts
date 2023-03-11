import GLTF from "../../../../script/main/assets/GLTF.js";
import Camera from "../../../../script/main/components/Camera.js";
import CameraControlPanel from "../../../../script/main/components/CameraControlPanel.js";
import DirectionalLight from "../../../../script/main/components/DirectionalLight.js";
import Profiler from "../../../../script/main/components/Profiler.js";
import { ClearFlagBit, SampleCountFlagBits } from "../../../../script/main/core/gfx/Pipeline.js";
import quat from "../../../../script/main/core/math/quat.js";
import vec3, { Vec3 } from "../../../../script/main/core/math/vec3.js";
import Node from "../../../../script/main/core/Node.js";
import Flow from "../../../../script/main/core/pipeline/Flow.js";
import Stage from "../../../../script/main/core/pipeline/Stage.js";
import PassPhase from "../../../../script/main/core/render/PassPhase.js";
import Zero from "../../../../script/main/core/Zero.js";
import ModelPhase from "../../../../script/main/pipeline/phases/ModelPhase.js";
import ForwardStage from "../../../../script/main/pipeline/stages/ForwardStage.js";
import ShadowStage from "../../../../script/main/pipeline/stages/ShadowStage.js";
import VisibilityBit from "../../../../script/main/VisibilityBit.js";

const PhaseLightView = 1 << 10;

const Visibility_Up = 1 << 9;
const Visibility_Down = 1 << 10;

const USE_SHADOW_MAP = 1;

export default class App extends Zero {
    async start(): Promise<Flow> {
        const { width, height } = this.window;

        const stages: Stage[] = [];
        let shadowStage: ShadowStage;
        if (USE_SHADOW_MAP) {
            shadowStage = new ShadowStage(Visibility_Up);
            stages.push(shadowStage);
        }

        const lit_position: Vec3 = [4, 4, 4];

        let node: Node;

        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = lit_position;
        // node.visibility = Visibility_Up;

        node = new Node;
        const down_camera = node.addComponent(Camera);
        down_camera.visibilityFlags = VisibilityBit.DEFAULT | Visibility_Down;
        down_camera.orthoHeight = 8;
        down_camera.far = 20
        down_camera.viewport = { x: 0, y: 0, width, height: height / 2 };
        node.position = lit_position;
        node.rotation = quat.rotationTo(quat.create(), vec3.create(0, 0, -1), vec3.normalize(vec3.create(), vec3.negate(vec3.create(), lit_position)));

        node = new Node;
        const up_camera = node.addComponent(Camera);
        up_camera.visibilityFlags = VisibilityBit.DEFAULT | Visibility_Up;
        up_camera.fov = 45;
        up_camera.viewport = { x: 0, y: height / 2, width, height: height / 2 };
        node.position = [0, 0, 10];

        const gltf_camera = new GLTF();
        await gltf_camera.load('./assets/camera_from_poly_by_google/scene');
        node = gltf_camera.createScene("Sketchfab_Scene")!;
        node.visibilityFlag = Visibility_Down;
        node.scale = [0.005, 0.005, 0.005];
        // const euler = quat.toEuler(vec3.create(), node.rotation);
        node.rotation = quat.multiply(quat.create(), node.rotation, quat.fromAxisAngle(quat.create(), vec3.UNIT_Z, Math.PI));
        up_camera.node.addChild(node);

        // UI
        node = new Node;
        const cameraUI = node.addComponent(Camera);
        cameraUI.visibilityFlags = VisibilityBit.UI;
        cameraUI.clearFlags = ClearFlagBit.DEPTH;
        cameraUI.orthoHeight = height / 2;
        cameraUI.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.visibilityFlag = VisibilityBit.UI;
        node.addComponent(Profiler);
        node.position = [-width / 2, - height / 2 + 200, 0];

        node = new Node;
        node.visibilityFlag = VisibilityBit.UI;
        node.addComponent(CameraControlPanel).camera = up_camera;
        node.position = [-width / 2, height / 2, 0];

        if (USE_SHADOW_MAP) {
            // node = new Node;
            // node.visibilityFlag = VisibilityBit.UI;
            // node.position = [width / 2 - 200, -height / 2 + 200, 0];
            // const sprite = node.addComponent(Sprite);
            // sprite.width = 200;
            // sprite.height = 200;
            // sprite.texture = shadowStage!.framebuffer.info.depthStencilAttachment;
        }

        // const zeroShader = await shaders.getShader('zero', { USE_ALBEDO_MAP });
        // const zeroDescriptorSet = gfx.createDescriptorSet();
        // zeroDescriptorSet.initialize(shaders.getDescriptorSetLayout(zeroShader));
        // if (USE_ALBEDO_MAP) {
        //     zeroDescriptorSet.bindTexture(0, gltf.textures[gltf.json.textures[textureIdx].source].gfx_texture, defaults.sampler);
        // }
        // const zeroPass = new Pass(
        //     zeroDescriptorSet,
        //     zeroShader,
        //     { cullMode: CullMode.FRONT },
        //     undefined,
        //     PhaseLightView
        // );

        const guardian = new GLTF();
        await guardian.load('./assets/guardian_zelda_botw_fan-art/scene', USE_SHADOW_MAP);
        node = guardian.createScene("Sketchfab_Scene")!;
        node.visibilityFlag = VisibilityBit.DEFAULT

        const plane = new GLTF();
        await plane.load('./assets/plane', USE_SHADOW_MAP);
        node = plane.createScene("Scene")!;
        node.visibilityFlag = VisibilityBit.DEFAULT
        node.scale = [4, 4, 4];

        stages.push(new ForwardStage([new ModelPhase(PassPhase.DEFAULT, VisibilityBit.UI | Visibility_Up | Visibility_Down)]));
        return new Flow(stages, SampleCountFlagBits.SAMPLE_COUNT_1);
    }
}

